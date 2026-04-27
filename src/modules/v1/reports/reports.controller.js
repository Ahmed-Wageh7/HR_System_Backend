import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './reports.service.js';

export const getPayrollReport = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getPayrollReport(req.params.month)));
export const getAttendanceReport = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getAttendanceReport(req.params.month)));
export const getStaffHistory = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getStaffHistory(req.params.id)));
