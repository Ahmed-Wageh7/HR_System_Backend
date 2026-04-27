import express from "express";
import validate from "../../../middleware/validate.js";
import { authLimiter } from "../../../middleware/rateLimiter.js";
import { requireRefreshToken } from "../../../middleware/auth.js";
import {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";
import validation from "./auth.validation.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(validation.signupSchema), signup);
router.post("/login", authLimiter, validate(validation.loginSchema), login);
router.post("/refresh-token", requireRefreshToken, refreshToken);
router.post("/logout", requireRefreshToken, logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate(validation.forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validate(validation.resetPasswordSchema),
  resetPassword,
);

export default router;
