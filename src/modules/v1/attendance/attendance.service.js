import Attendance from '../../../model/attendance.model.js';
import Staff from '../../../model/staff.model.js';
import AppError from '../../../utils/AppError.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';

const getDayStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const checkIn = async (userId, req) => {
  const staff = await Staff.findOne({ user: userId });
  if (!staff) throw new AppError('Staff profile not found', 404);

  const date = getDayStart();
  const existing = await Attendance.findOne({ staff: staff._id, date });
  if (existing?.checkIn) throw new AppError('You have already checked in today', 400);

  const now = new Date();
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
  const attendance =
    existing ||
    new Attendance({
      staff: staff._id,
      date
    });

  attendance.checkIn = now;
  attendance.isLate = isLate;
  await attendance.save();

  await createAuditLog({
    user: userId,
    action: 'attendance.checkin',
    resource: 'Attendance',
    resourceId: attendance._id,
    after: attendance.toObject(),
    req
  });

  return attendance;
};

export const checkOut = async (userId, req) => {
  const staff = await Staff.findOne({ user: userId });
  if (!staff) throw new AppError('Staff profile not found', 404);

  const attendance = await Attendance.findOne({ staff: staff._id, date: getDayStart() });
  if (!attendance || !attendance.checkIn) throw new AppError('You have not checked in today', 400);
  if (attendance.checkOut) throw new AppError('You have already checked out today', 400);

  attendance.checkOut = new Date();
  attendance.workingHours = Number(((attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60)).toFixed(2));
  if (attendance.workingHours < 8) {
    attendance.deductionAmount = staff.dailySalary * 0.1;
  }
  await attendance.save();

  await createAuditLog({
    user: userId,
    action: 'attendance.checkout',
    resource: 'Attendance',
    resourceId: attendance._id,
    after: attendance.toObject(),
    req
  });

  return attendance;
};

export default {
  checkIn,
  checkOut
};
