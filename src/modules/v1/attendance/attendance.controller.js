import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './attendance.service.js';

export const checkIn = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.checkIn(req.user._id, req)));
export const checkOut = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.checkOut(req.user._id, req)));
