import Staff from '../../../model/staff.model.js';
import Attendance from '../../../model/attendance.model.js';
import { calculateMonthlySalary } from '../salary/salary.service.js';
import AppError from '../../../utils/AppError.js';

export const getPayrollReport = async (month) => {
  const staffMembers = await Staff.find().populate('user department');
  return Promise.all(
    staffMembers.map(async (staff) => ({
      staffId: staff._id,
      employeeCode: staff.employeeCode,
      name: staff.user?.name,
      department: staff.department?.name,
      salary: await calculateMonthlySalary(staff._id, month)
    }))
  );
};

export const getAttendanceReport = async (month) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return Attendance.find({ date: { $gte: start, $lt: end } }).populate({
    path: 'staff',
    populate: { path: 'user' }
  });
};

export const getStaffHistory = async (staffId) => {
  const staff = await Staff.findById(staffId).populate('user department');
  if (!staff) throw new AppError('Staff not found', 404);
  const attendance = await Attendance.find({ staff: staffId });
  return { staff, attendance, monthlyReports: staff.monthlyReports };
};

export default {
  getPayrollReport,
  getAttendanceReport,
  getStaffHistory
};
