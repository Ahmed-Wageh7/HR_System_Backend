import APIFeatures from '../../../utils/apiFeatures.js';
import AppError from '../../../utils/AppError.js';
import Role from '../../../model/role.model.js';
import User from '../../../model/user.model.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';
import {
  getRoleById,
  syncUserPermissionsFromRole,
  syncUsersPermissionsForRole
} from '../../../common/auth/role-permissions.service.js';

export const createRole = async (payload, req) => {
  const role = await Role.create(payload);
  await createAuditLog({
    user: req.user._id,
    action: 'role.create',
    resource: 'Role',
    resourceId: role._id,
    after: role.toObject(),
    req
  });
  return role;
};

export const listRoles = async (queryString) => {
  const totalDocuments = await Role.countDocuments();
  const features = new APIFeatures(Role.find(), queryString).sort('name').paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export const updateRole = async (id, payload, req) => {
  const role = await Role.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!role) throw new AppError('Role not found', 404);
  await syncUsersPermissionsForRole(role._id, role.permissions);
  await createAuditLog({
    user: req.user._id,
    action: 'role.update',
    resource: 'Role',
    resourceId: role._id,
    after: role.toObject(),
    req
  });
  return role;
};

export const deleteRole = async (id, req) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError('Role not found', 404);
  if (role.isSystem) throw new AppError('System roles cannot be deleted', 400);
  role.isDeleted = true;
  role.deletedAt = new Date();
  await role.save();

  await createAuditLog({
    user: req.user._id,
    action: 'role.delete',
    resource: 'Role',
    resourceId: role._id,
    req
  });
};

export const assignPermissions = async (id, permissions, req) => {
  const role = await Role.findByIdAndUpdate(
    id,
    { $addToSet: { permissions: { $each: permissions } } },
    { new: true }
  );
  if (!role) throw new AppError('Role not found', 404);
  await syncUsersPermissionsForRole(role._id, role.permissions);
  await createAuditLog({
    user: req.user._id,
    action: 'permission.assign',
    resource: 'Role',
    resourceId: role._id,
    after: role.toObject(),
    req
  });
  return role;
};

export const removePermissions = async (id, permissions, req) => {
  const role = await Role.findByIdAndUpdate(
    id,
    { $pull: { permissions: { $in: permissions } } },
    { new: true }
  );
  if (!role) throw new AppError('Role not found', 404);
  await syncUsersPermissionsForRole(role._id, role.permissions);
  await createAuditLog({
    user: req.user._id,
    action: 'permission.revoke',
    resource: 'Role',
    resourceId: role._id,
    req
  });
  return role;
};

export const assignRoleToUser = async (userId, roleId, req) => {
  const role = await getRoleById(roleId);
  if (!role) throw new AppError('Role not found', 404);

  await syncUserPermissionsFromRole(userId, role._id);
  const user = await User.findById(userId).populate('role');
  if (!user) throw new AppError('User not found', 404);
  await createAuditLog({
    user: req.user._id,
    action: 'role.assign',
    resource: 'User',
    resourceId: user._id,
    after: { role: user.role?.name },
    req
  });
  return user;
};

export default {
  createRole,
  listRoles,
  updateRole,
  deleteRole,
  assignPermissions,
  removePermissions,
  assignRoleToUser
};
