import Role from '../../model/role.model.js';
import User from '../../model/user.model.js';

const normalizePermissions = (permissions = []) => [...new Set(permissions)];

export const getRoleById = async (roleId) => {
  if (!roleId) return null;
  return Role.findById(roleId);
};

export const getEffectivePermissions = (user = {}, role = null) =>
  normalizePermissions([...(user.permissions || []), ...((role && role.permissions) || [])]);

export const syncUserPermissionsFromRole = async (userId, roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    return null;
  }

  await User.findByIdAndUpdate(userId, { role: role._id, permissions: normalizePermissions(role.permissions) });
  return role;
};

export const syncUsersPermissionsForRole = async (roleId, permissions = []) =>
  User.updateMany({ role: roleId }, { permissions: normalizePermissions(permissions) });

export default {
  getRoleById,
  getEffectivePermissions,
  syncUserPermissionsFromRole,
  syncUsersPermissionsForRole
};
