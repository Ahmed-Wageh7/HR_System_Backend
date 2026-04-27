import AppError from '../utils/AppError.js';
import Role from '../model/role.model.js';

const isRoleDocument = (role) => Boolean(role && typeof role === 'object' && !Array.isArray(role));

const resolveRole = async (role) => {
  if (!role) return null;

  if (isRoleDocument(role) && (role.name || role.permissions)) {
    return role;
  }

  try {
    return await Role.findById(role).lean();
  } catch {
    return null;
  }
};

export default (...permissions) => async (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  const role = await resolveRole(req.user.role);
  const rolePermissions = role?.permissions || [];

  if (role?.name === 'admin') {
    return next();
  }

  const userPermissions = new Set([...(req.user.permissions || []), ...rolePermissions]);

  const allowed = permissions.every((permission) => userPermissions.has(permission));
  if (!allowed) return next(new AppError('You do not have permission to perform this action', 403));

  return next();
};
