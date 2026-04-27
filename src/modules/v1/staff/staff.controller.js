import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './staff.service.js';

export const createStaff = asyncHandler(async (req, res) => sendSuccess(res, 201, await service.createStaff(req.body, req)));
export const listStaff = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listStaff(req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const getStaff = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.getStaff(req.params.id)));
export const updateStaff = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.updateStaff(req.params.id, req.body, req)));
export const deleteStaff = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.softDeleteStaff(req.params.id, req)));
export const restoreStaff = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.restoreStaff(req.params.id, req)));
export const getAttendance = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.getAttendance(req.params.id, req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const getMonthlyAttendanceSummary = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.getMonthlyAttendanceSummary(req.params.id, req.params.month))
);
export const addDeduction = asyncHandler(async (req, res) =>
  sendSuccess(res, 201, await service.addDeduction(req.params.id, req.body, req))
);
export const listDeductions = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listDeductions(req.params.id, req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const updateDeduction = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.updateDeduction(req.params.id, req.params.did, req.body, req))
);
export const deleteDeduction = asyncHandler(async (req, res) => {
  await service.deleteDeduction(req.params.id, req.params.did, req);
  return sendSuccess(res, 200, { message: 'Deduction removed successfully' });
});
export const calculateSalary = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.calculateSalary(req.params.id, req.params.month))
);
export const paySalary = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.paySalary(req.params.id, req.params.month, req))
);
export const adjustSalary = asyncHandler(async (req, res) => {
  await service.adjustSalary(req.params.id, req.params.month, req.body.adjustments, req);
  return sendSuccess(res, 200, { message: 'Salary adjusted successfully' });
});
export const uploadDocument = asyncHandler(async (req, res) =>
  sendSuccess(res, 201, await service.uploadDocument(req.params.id, req.file, req))
);
export const deleteDocument = asyncHandler(async (req, res) => {
  await service.deleteDocument(req.params.id, req.params.docId, req);
  return sendSuccess(res, 200, { message: 'Document deleted successfully' });
});
export const bulkPaySalary = asyncHandler(async (req, res) => {
  await service.bulkPaySalary(req.params.month);
  return sendSuccess(res, 202, { message: 'Bulk salary processing queued' });
});
