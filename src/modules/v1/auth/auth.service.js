import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import env from "../../../../config/env.service.js";
import AppError from "../../../utils/AppError.js";
import User from "../../../model/user.model.js";
import Role from "../../../model/role.model.js";
import RefreshToken from "../../../model/refreshToken.model.js";
import { emailQueue } from "../../../common/queues.js";
import { createAuditLog } from "../../../common/audit/audit.service.js";
import { getEffectivePermissions } from "../../../common/auth/role-permissions.service.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "../../../middleware/auth.js";
import { hashValue, randomToken } from "../../../utils/security.js";
import logger from "../../../utils/logger.js";

const buildCookieOptions = () => ({
  httpOnly: env.cookies.httpOnly,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  path: env.cookies.path,
  maxAge: env.cookies.maxAge,
});

const buildClearCookieOptions = () => {
  const { maxAge, ...options } = buildCookieOptions();
  return options;
};

const issueRefreshPair = async (user, req, family, replacedBy) => {
  const refreshToken = signRefreshToken({ sub: user._id, family });
  const hashedToken = hashToken(refreshToken);
  const decoded = jwt.decode(refreshToken);

  await RefreshToken.create({
    token: hashedToken,
    user: user._id,
    family,
    expiresAt: new Date(decoded.exp * 1000),
    replacedBy,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  return refreshToken;
};

const getUserWithRole = async (userId) =>
  User.findById(userId).populate("role").lean({ virtuals: true });

export const signup = async (payload, req, res) => {
  const exists = await User.findOne({ email: payload.email }).setOptions({
    includeDeleted: true,
  });
  if (exists) throw new AppError("Email already registered", 409);

  let defaultRole = await Role.findOne({ name: "staff" });
  if (!defaultRole) {
    defaultRole = await Role.create({
      name: "staff",
      description: "Default staff role",
      permissions: ["leave:create", "leave:read", "attendance:write"],
    });
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    ...payload,
    password: hashedPassword,
    role: defaultRole._id,
    permissions: defaultRole.permissions,
  });

  emailQueue
    .add({
      to: user.email,
      subject: "Welcome to HR Management System",
      text: `Welcome ${user.name}`,
      html: `<p>Welcome ${user.name}</p>`,
    })
    .catch((error) => {
      logger.warn("WELCOME_EMAIL_QUEUE_FAILED", {
        email: user.email,
        message: error.message,
      });
    });

  const populatedUser = await getUserWithRole(user._id);
  const accessToken = signAccessToken(populatedUser);
  const family = uuidv4();
  const refreshToken = await issueRefreshPair(populatedUser, req, family);

  res.cookie(env.cookie.refreshName, refreshToken, buildCookieOptions());

  await createAuditLog({
    user: user._id,
    action: "auth.signup",
    resource: "User",
    resourceId: user._id,
    after: { email: user.email, name: user.name },
    req,
  });

  return {
    accessToken,
    user: {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role?.name,
      permissions: getEffectivePermissions(populatedUser, populatedUser.role),
    },
  };
};

export const login = async ({ email, password }, req, res) => {
  const user = await User.findOne({ email })
    .select("+password")
    .populate("role");
  if (!user || user.isDeleted || !user.isActive)
    throw new AppError("Invalid credentials", 401);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new AppError("Invalid credentials", 401);

  const accessToken = signAccessToken(user);
  const family = uuidv4();
  const refreshToken = await issueRefreshPair(user, req, family);

  res.cookie(env.cookie.refreshName, refreshToken, buildCookieOptions());

  await createAuditLog({
    user: user._id,
    action: "login",
    resource: "User",
    resourceId: user._id,
    after: { email: user.email },
    req,
  });

  return {
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      permissions: getEffectivePermissions(user, user.role),
    },
  };
};

export const refresh = async (tokenDoc, refreshToken, req, res) => {
  if (tokenDoc.revokedAt) {
    await RefreshToken.updateMany(
      { family: tokenDoc.family, revokedAt: null },
      { revokedAt: new Date() },
    );
    throw new AppError("Refresh token reuse detected", 401);
  }

  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();

  const user = await User.findById(tokenDoc.user).populate("role");
  if (!user || user.isDeleted || !user.isActive)
    throw new AppError("User no longer available", 401);

  const nextRefreshToken = signRefreshToken({
    sub: user._id,
    family: tokenDoc.family,
  });
  tokenDoc.replacedBy = hashToken(nextRefreshToken);
  await tokenDoc.save();

  const decoded = jwt.decode(nextRefreshToken);
  await RefreshToken.create({
    token: hashToken(nextRefreshToken),
    user: user._id,
    family: tokenDoc.family,
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  const accessToken = signAccessToken(user);
  res.cookie(env.cookie.refreshName, nextRefreshToken, buildCookieOptions());

  await createAuditLog({
    user: user._id,
    action: "token.refresh",
    resource: "RefreshToken",
    resourceId: tokenDoc._id,
    req,
  });

  return { accessToken };
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.[env.cookie.refreshName];
  let tokenDoc;

  if (refreshToken) {
    tokenDoc = await RefreshToken.findOneAndUpdate(
      { token: hashToken(refreshToken), revokedAt: null },
      { revokedAt: new Date() },
      { new: true },
    );
  }

  res.clearCookie(env.cookie.refreshName, buildClearCookieOptions());

  if (tokenDoc) {
    await createAuditLog({
      user: tokenDoc.user,
      action: "logout",
      resource: "RefreshToken",
      resourceId: tokenDoc._id,
      req,
    });
  }
};

export const forgotPassword = async ({ email }, req) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = randomToken();
  user.passwordResetToken = hashValue(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  emailQueue
    .add({
      to: user.email,
      subject: "Reset your password",
      text: `${env.clientUrl}/reset-password/${resetToken}`,
      html: `<p>${env.clientUrl}/reset-password/${resetToken}</p>`,
    })
    .catch((error) => {
      logger.warn("RESET_EMAIL_QUEUE_FAILED", {
        email: user.email,
        message: error.message,
      });
    });

  await createAuditLog({
    user: user._id,
    action: "password.reset.request",
    resource: "User",
    resourceId: user._id,
    req,
  });
};

export const resetPassword = async (token, { password }, req) => {
  const user = await User.findOne({
    passwordResetToken: hashValue(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) throw new AppError("Reset token is invalid or expired", 400);

  user.password = await bcrypt.hash(password, 12);
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date() },
  );

  await createAuditLog({
    user: user._id,
    action: "password.reset.complete",
    resource: "User",
    resourceId: user._id,
    req,
  });
};

export default {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
