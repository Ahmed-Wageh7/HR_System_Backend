import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import AppError from '../../../utils/AppError.js';
import authService from './auth.service.js';

export const signup = asyncHandler(async (req, res) => {
  const data = await authService.signup(req.body, req, res);
  return sendSuccess(res, 201, data);
});

export const login = asyncHandler(async (req, res) => {
  throw new AppError('Login has been disabled for this deployment', 410);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.refreshTokenDoc, req.refreshToken, req, res);
  return sendSuccess(res, 200, data);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.refreshTokenDoc, req, res);
  return sendSuccess(res, 200, { message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body, req);
  return sendSuccess(res, 200, { message: 'If the email exists, a reset link has been queued.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body, req);
  return sendSuccess(res, 200, { message: 'Password reset successfully' });
});
