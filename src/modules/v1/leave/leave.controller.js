import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './leave.service.js';

export const createLeave = asyncHandler(async (req, res) => sendSuccess(res, 201, await service.createLeave(req.user._id, req.body, req)));
export const listMyLeaves = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listMyLeaves(req.user._id, req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const getLeave = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getLeave(req.user._id, req.params.id)));
export const cancelLeave = asyncHandler(async (req, res) => {
  await service.cancelLeave(req.user._id, req.params.id, req);
  return sendSuccess(res, 200, { message: 'Leave cancelled successfully' });
});
export const listAllLeaves = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listAllLeaves(req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const reviewLeave = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.reviewLeave(req.params.id, req.body, req)));
