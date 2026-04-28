import User from '../../../model/user.model.js';
import AppError from '../../../utils/AppError.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';
import { cleanupStoredFile } from '../../../utils/fileCleanup.js';
import { persistUploadedFile } from '../../../utils/uploadedFile.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('role');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (userId, payload, req) => {
  const before = await User.findById(userId).lean();
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true
  }).populate('role');

  await createAuditLog({
    user: userId,
    action: 'user.profile.update',
    resource: 'User',
    resourceId: userId,
    before,
    after: user.toObject(),
    req
  });

  return user;
};

export const softDeleteProfile = async (userId, req) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true, deletedAt: new Date(), isActive: false },
    { new: true }
  );

  await createAuditLog({
    user: userId,
    action: 'user.profile.delete',
    resource: 'User',
    resourceId: userId,
    after: { isDeleted: true },
    req
  });

  return user;
};

export const uploadAvatar = async (userId, file, req) => {
  if (!file) throw new AppError('Avatar file is required', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (user.avatar) await cleanupStoredFile(user.avatar);

  const storedFile = await persistUploadedFile(file, 'avatars');

  user.avatar = {
    path: storedFile.path,
    url: storedFile.url,
    publicId: storedFile.publicId
  };
  await user.save();

  await createAuditLog({
    user: userId,
    action: 'file.upload',
    resource: 'UserAvatar',
    resourceId: userId,
    after: user.avatar,
    req
  });

  return user.avatar;
};

export const deleteAvatar = async (userId, req) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.avatar) await cleanupStoredFile(user.avatar);
  user.avatar = undefined;
  await user.save();

  await createAuditLog({
    user: userId,
    action: 'file.delete',
    resource: 'UserAvatar',
    resourceId: userId,
    req
  });
};

export default {
  getProfile,
  updateProfile,
  softDeleteProfile,
  uploadAvatar,
  deleteAvatar
};
