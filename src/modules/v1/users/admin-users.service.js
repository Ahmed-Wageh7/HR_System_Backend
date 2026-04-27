import AppError from '../../../utils/AppError.js';
import User from '../../../model/user.model.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';

export const restoreUser = async (id, req) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null, isActive: true },
    { new: true, includeDeleted: true }
  );

  if (!user) throw new AppError('User not found', 404);

  await createAuditLog({
    user: req.user._id,
    action: 'user.restore',
    resource: 'User',
    resourceId: user._id,
    req
  });

  return user;
};

export default {
  restoreUser
};
