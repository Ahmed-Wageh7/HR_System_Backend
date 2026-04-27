import APIFeatures from '../../../utils/apiFeatures.js';
import AppError from '../../../utils/AppError.js';
import Department from '../../../model/department.model.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';

export const createDepartment = async (payload, req) => {
  const department = await Department.create(payload);
  await createAuditLog({
    user: req.user._id,
    action: 'department.create',
    resource: 'Department',
    resourceId: department._id,
    after: department.toObject(),
    req
  });
  return department;
};

export const listDepartments = async (queryString) => {
  const totalDocuments = await Department.countDocuments();
  const features = new APIFeatures(Department.find(), queryString).sort('name').paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export const updateDepartment = async (id, payload, req) => {
  const department = await Department.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!department) throw new AppError('Department not found', 404);
  await createAuditLog({
    user: req.user._id,
    action: 'department.update',
    resource: 'Department',
    resourceId: department._id,
    after: department.toObject(),
    req
  });
  return department;
};

export const deleteDepartment = async (id, req) => {
  const department = await Department.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!department) throw new AppError('Department not found', 404);
  await createAuditLog({
    user: req.user._id,
    action: 'department.delete',
    resource: 'Department',
    resourceId: department._id,
    req
  });
};

export const restoreDepartment = async (id, req) => {
  const department = await Department.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null },
    { new: true, includeDeleted: true }
  );
  if (!department) throw new AppError('Department not found', 404);
  await createAuditLog({
    user: req.user._id,
    action: 'department.restore',
    resource: 'Department',
    resourceId: department._id,
    req
  });
  return department;
};

export default {
  createDepartment,
  listDepartments,
  updateDepartment,
  deleteDepartment,
  restoreDepartment
};
