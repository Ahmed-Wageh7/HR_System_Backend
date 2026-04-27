import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './tickets.service.js';

export const createTicket = asyncHandler(async (req, res) => sendSuccess(res, 201, await service.createTicket(req.user._id, req.body)));
export const listMyTickets = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listMyTickets(req.user._id, req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const getTicket = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getTicket(req.user._id, req.params.id)));
export const replyTicket = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.replyTicket(req.params.id, req.user._id, req.body.message)));
export const updateStatus = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.updateStatus(req.params.id, req.body.status)));
