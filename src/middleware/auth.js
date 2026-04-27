import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../../config/env.service.js';
import AppError from '../utils/AppError.js';
import User from '../model/user.model.js';
import RefreshToken from '../model/refreshToken.model.js';
import { getEffectivePermissions } from '../common/auth/role-permissions.service.js';

const createTokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const getAccessTokenSecret = () => process.env.JWT_SECRET || env.jwt?.secret || env.jwtSecret;
const getRefreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || env.jwtRefresh?.secret || env.jwtRefreshSecret;
const getAccessTokenExpiry = () => process.env.JWT_EXPIRE || env.jwt?.expire || env.jwtExpire || '15m';
const getRefreshTokenExpiry = () => process.env.JWT_REFRESH_EXPIRE || env.jwtRefresh?.expire || env.jwtRefreshExpire || '7d';

export const hashToken = createTokenHash;

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id,
      role: user.role?.name || user.roleName || 'user',
      permissions: getEffectivePermissions(user, user.role)
    },
    getAccessTokenSecret(),
    { expiresIn: getAccessTokenExpiry() }
  );

export const signRefreshToken = (payload) =>
  jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: getRefreshTokenExpiry() });

export const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return next(new AppError('Authentication required', 401));

  try {
    const decoded = jwt.verify(token, getAccessTokenSecret());
    const user = await User.findById(decoded.sub).populate('role');

    if (!user || user.isDeleted || !user.isActive) {
      return next(new AppError('User no longer exists or is inactive', 401));
    }

    req.user = user;
    req.auth = decoded;
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired access token', 401));
  }
};

export const requireRefreshToken = async (req, res, next) => {
  const token = req.cookies?.[env.cookie.refreshName];
  if (!token) return next(new AppError('Refresh token missing', 401));

  try {
    const decoded = jwt.verify(token, getRefreshTokenSecret());
    const hashed = createTokenHash(token);
    const storedToken = await RefreshToken.findOne({ token: hashed }).populate('user');

    if (!storedToken) return next(new AppError('Refresh token not recognized', 401));

    req.refreshToken = token;
    req.refreshTokenDoc = storedToken;
    req.refreshTokenPayload = decoded;
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
};

export default {
  hashToken,
  signAccessToken,
  signRefreshToken,
  auth,
  requireRefreshToken
};
