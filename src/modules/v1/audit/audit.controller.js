import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './audit.service.js';

export const listLogs = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listLogs(req.query);
  return sendSuccess(res, 200, results, pagination);
});

export const listByUser = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listLogs(req.query, { user: req.params.userId });
  return sendSuccess(res, 200, results, pagination);
});

export const listByResource = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listLogs(req.query, { resource: req.params.resource });
  return sendSuccess(res, 200, results, pagination);
});
