import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './departments.service.js';

export const createDepartment = asyncHandler(async (req, res) => sendSuccess(res, 201, await service.createDepartment(req.body, req)));
export const listDepartments = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listDepartments(req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const updateDepartment = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.updateDepartment(req.params.id, req.body, req)));
export const deleteDepartment = asyncHandler(async (req, res) => {
  await service.deleteDepartment(req.params.id, req);
  return sendSuccess(res, 200, { message: 'Department deleted successfully' });
});
export const restoreDepartment = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.restoreDepartment(req.params.id, req)));
