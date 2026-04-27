import asyncHandler from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/response.js';
import service from './roles.service.js';

export const createRole = asyncHandler(async (req, res) => sendSuccess(res, 201, await service.createRole(req.body, req)));
export const listRoles = asyncHandler(async (req, res) => {
  const { results, pagination } = await service.listRoles(req.query);
  return sendSuccess(res, 200, results, pagination);
});
export const updateRole = asyncHandler(async (req, res) => sendSuccess(res, 200, await service.updateRole(req.params.id, req.body, req)));
export const deleteRole = asyncHandler(async (req, res) => {
  await service.deleteRole(req.params.id, req);
  return sendSuccess(res, 200, { message: 'Role deleted successfully' });
});
export const assignPermissions = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.assignPermissions(req.params.id, req.body.permissions || [], req))
);
export const removePermissions = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.removePermissions(req.params.id, req.body.permissions || [], req))
);
export const assignRoleToUser = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, await service.assignRoleToUser(req.params.id, req.body.roleId, req))
);
