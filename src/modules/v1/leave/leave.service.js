import APIFeatures from '../../../utils/apiFeatures.js';
import AppError from '../../../utils/AppError.js';
import Leave from '../../../model/leave.model.js';
import Staff from '../../../model/staff.model.js';
import withTransaction from '../../../middleware/transaction.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';
import { emitToAdmins } from '../notifications/socket.js';

const calculateDays = (startDate, endDate) =>
  Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

export const createLeave = async (userId, payload, req) => {
  const staff = await Staff.findOne({ user: userId });
  if (!staff) throw new AppError('Staff profile not found', 404);

  const overlap = await Leave.findOne({
    staff: staff._id,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: payload.endDate },
    endDate: { $gte: payload.startDate }
  });
  if (overlap) throw new AppError('Leave request overlaps with an existing request', 400);

  const days = calculateDays(payload.startDate, payload.endDate);
  if (staff.annualLeaveBalance < days) throw new AppError('Insufficient leave balance', 400);

  const leave = await Leave.create({ ...payload, staff: staff._id, days });
  emitToAdmins('user:receive-message', {
    type: 'announcement',
    title: 'New leave request',
    message: `${req.user.name} submitted a leave request`
  });

  await createAuditLog({
    user: userId,
    action: 'leave.create',
    resource: 'Leave',
    resourceId: leave._id,
    after: leave.toObject(),
    req
  });

  return leave;
};

export const listMyLeaves = async (userId, queryString) => {
  const staff = await Staff.findOne({ user: userId });
  if (!staff) throw new AppError('Staff profile not found', 404);
  const totalDocuments = await Leave.countDocuments({ staff: staff._id });
  const features = new APIFeatures(Leave.find({ staff: staff._id }), queryString)
    .sort('-createdAt')
    .paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export const getLeave = async (userId, leaveId) => {
  const staff = await Staff.findOne({ user: userId });
  const leave = await Leave.findOne({ _id: leaveId, staff: staff._id });
  if (!leave) throw new AppError('Leave not found', 404);
  return leave;
};

export const cancelLeave = async (userId, leaveId, req) => {
  const staff = await Staff.findOne({ user: userId });
  const leave = await Leave.findOne({ _id: leaveId, staff: staff._id });
  if (!leave) throw new AppError('Leave not found', 404);
  if (leave.status !== 'pending') throw new AppError('Only pending leaves can be cancelled', 400);

  leave.status = 'cancelled';
  await leave.save();

  await createAuditLog({
    user: userId,
    action: 'leave.cancel',
    resource: 'Leave',
    resourceId: leave._id,
    req
  });
};

export const listAllLeaves = async (queryString) => {
  const totalDocuments = await Leave.countDocuments();
  const features = new APIFeatures(Leave.find().populate({ path: 'staff', populate: { path: 'user' } }), queryString)
    .filter([])
    .sort('-createdAt')
    .paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export const reviewLeave = async (leaveId, payload, req) =>
  withTransaction(async (session) => {
    const leave = await Leave.findById(leaveId).session(session);
    if (!leave) throw new AppError('Leave not found', 404);
    if (leave.status !== 'pending') throw new AppError('Leave request already reviewed', 400);

    leave.status = payload.status;
    leave.reviewNote = payload.reviewNote;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save({ session });

    if (payload.status === 'approved') {
      const staff = await Staff.findById(leave.staff).session(session);
      staff.annualLeaveBalance -= leave.days;
      await staff.save({ session });
    }

    await createAuditLog({
      user: req.user._id,
      action: `leave.${payload.status}`,
      resource: 'Leave',
      resourceId: leave._id,
      after: leave.toObject(),
      req,
      session
    });

    return leave;
  });

export default {
  createLeave,
  listMyLeaves,
  getLeave,
  cancelLeave,
  listAllLeaves,
  reviewLeave
};
