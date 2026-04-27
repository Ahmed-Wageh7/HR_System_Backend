import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './admin-users.service.js';

export const restoreUser = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.restoreUser(req.params.id, req)));
