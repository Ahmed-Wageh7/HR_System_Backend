import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './users.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const data = await service.getProfile(req.user._id);
  return sendSuccess(res, 200, data);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await service.updateProfile(req.user._id, req.body, req);
  return sendSuccess(res, 200, data);
});

export const softDeleteProfile = asyncHandler(async (req, res) => {
  const data = await service.softDeleteProfile(req.user._id, req);
  return sendSuccess(res, 200, data);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const data = await service.uploadAvatar(req.user._id, req.file, req);
  return sendSuccess(res, 200, data);
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  await service.deleteAvatar(req.user._id, req);
  return sendSuccess(res, 200, { message: 'Avatar deleted successfully' });
});
