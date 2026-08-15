import Role from '../../model/role.model.js';
import User from '../../model/user.model.js';

export const normalizePermissions = (permissions = []) => [...new Set(permissions)];

const isRoleDocument = (role) => Boolean(role && typeof role === 'object' && !Array.isArray(role));

const getDocumentId = (document) => document?._id || document;

const haveSamePermissions = (left = [], right = []) => {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  if (leftSet.size !== rightSet.size) return false;

  return [...leftSet].every((permission) => rightSet.has(permission));
};

const assignResolvedRole = (user, role, permissions) => {
  if (!user || !role) return user;

  user.role = role;
  user.permissions = permissions;
  return user;
};

export const getRoleById = async (roleId) => {
  if (!roleId) return null;
  return Role.findById(roleId);
};

export const getEffectivePermissions = (user = {}, role = null) =>
  normalizePermissions([...(user.permissions || []), ...((role && role.permissions) || [])]);

export const getRoleByPermissions = async (permissions = []) => {
  if (!permissions.length) return null;

  const roles = await Role.find();
  return roles.find((role) => haveSamePermissions(permissions, role.permissions)) || null;
};

export const resolveUserRbacContext = async (user, { persist = false } = {}) => {
  if (!user) return { user, role: null, permissions: [] };

  let role = null;

  if (isRoleDocument(user.role) && (user.role.name || user.role.permissions)) {
    role = user.role;
  } else if (user.role) {
    role = await getRoleById(user.role);
  }

  if (!role) {
    role = await getRoleByPermissions(user.permissions || []);
  }

  const permissions = getEffectivePermissions(user, role);

  if (persist && role && user._id) {
    const currentRoleId = getDocumentId(user.role)?.toString();
    const resolvedRoleId = role._id?.toString();
    const shouldUpdateRole = !currentRoleId || currentRoleId !== resolvedRoleId;
    const shouldUpdatePermissions = !haveSamePermissions(user.permissions || [], permissions);

    if (shouldUpdateRole || shouldUpdatePermissions) {
      await User.findByIdAndUpdate(user._id, {
        role: role._id,
        permissions
      });
    }
  }

  assignResolvedRole(user, role, permissions);

  return { user, role, permissions };
};

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
  normalizePermissions,
  getRoleById,
  getRoleByPermissions,
  getEffectivePermissions,
  resolveUserRbacContext,
  syncUserPermissionsFromRole,
  syncUsersPermissionsForRole
};
