import AppError from '../utils/AppError.js';
import { resolveUserRbacContext } from '../common/auth/role-permissions.service.js';

export default (...permissions) => async (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  const {
    role,
    permissions: effectivePermissions
  } = await resolveUserRbacContext(req.user, { persist: true });

  if (role?.name === 'admin') {
    return next();
  }

  const userPermissions = new Set(effectivePermissions);

  const allowed = permissions.every((permission) => userPermissions.has(permission));
  if (!allowed) return next(new AppError('You do not have permission to perform this action', 403));

  return next();
};
