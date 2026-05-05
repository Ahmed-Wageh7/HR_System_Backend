import Staff from '../../../model/staff.model.js';
import Attendance from '../../../model/attendance.model.js';
import Deduction from '../../../model/deduction.model.js';
import Leave from '../../../model/leave.model.js';
import withTransaction from '../../../middleware/transaction.js';
import { createAuditLog } from '../../../common/audit/audit.service.js';
import AppError from '../../../utils/AppError.js';

const getMonthBounds = (month) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { start, end };
};

const computeWorkingDaysInMonth = (month) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1, 1));
  let count = 0;

  while (date.getUTCMonth() === monthIndex - 1) {
    const day = date.getUTCDay();
    if (day !== 5 && day !== 6) count += 1;
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return count;
};

export const calculateMonthlySalary = async (staffId, month) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw new AppError('Staff not found', 404);

  const existingReport = staff.monthlyReports.find((report) => report.month === month);
  if (existingReport?.isPaid) {
    return {
      totalDaysWorked: existingReport.totalDaysWorked || 0,
      lateDays: existingReport.lateDays || 0,
      absentDays: existingReport.absentDays || 0,
      totalDeductions: existingReport.totalDeductions || 0,
      adjustments: existingReport.adjustments || 0,
      finalSalary: existingReport.finalSalary || 0,
      isPaid: true
    };
  }

  const { start, end } = getMonthBounds(month);
  const [attendanceRecords, deductions, approvedLeaves] = await Promise.all([
    Attendance.find({ staff: staffId, date: { $gte: start, $lt: end } }),
    Deduction.find({ staff: staffId, month }),
    Leave.find({ staff: staffId, status: 'approved', startDate: { $lt: end }, endDate: { $gte: start } })
  ]);

  const workingDays = computeWorkingDaysInMonth(month);
  const lateDays = attendanceRecords.filter((record) => record.isLate).length;
  const leaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const absentDays = Math.max(
    0,
    workingDays -
      attendanceRecords.filter((record) => record.checkIn || record.checkOut).length -
      leaveDays
  );
  const manualDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  const lateDeduction = lateDays * (staff.dailySalary * 0.1);
  const absentDeduction = absentDays * staff.dailySalary;
  const baseSalary = staff.dailySalary * workingDays;
  const totalDeductions = lateDeduction + absentDeduction + manualDeductions;
  const adjustments = existingReport?.adjustments || 0;

  return {
    totalDaysWorked: attendanceRecords.filter((record) => !record.isAbsent).length,
    lateDays,
    absentDays,
    totalDeductions,
    adjustments,
    finalSalary: baseSalary - totalDeductions + adjustments,
    isPaid: false
  };
};

export const payMonthlySalary = async (
  staffId,
  month,
  { allowAlreadyPaid = false, actorUserId, req } = {}
) =>
  withTransaction(async (session) => {
    const result = await calculateMonthlySalary(staffId, month);
    const paidResult = {
      ...result,
      isPaid: true
    };

    const staff = await Staff.findById(staffId)
      .setOptions({ includeDeleted: true })
      .session(session);

    if (!staff) throw new AppError('Staff not found', 404);

    const existing = staff.monthlyReports.find((report) => report.month === month);

    if (existing?.isPaid) {
      if (!allowAlreadyPaid) {
        throw new AppError('Salary already paid for this month', 400);
      }

      return {
        totalDaysWorked: existing.totalDaysWorked || 0,
        lateDays: existing.lateDays || 0,
        absentDays: existing.absentDays || 0,
        totalDeductions: existing.totalDeductions || 0,
        adjustments: existing.adjustments || 0,
        finalSalary: existing.finalSalary || 0,
        isPaid: true
      };
    }

    if (existing) {
      Object.assign(existing, {
        ...paidResult,
        month,
        isPaid: true,
        paidAt: new Date()
      });
    } else {
      staff.monthlyReports.push({
        ...paidResult,
        month,
        isPaid: true,
        paidAt: new Date()
      });
    }

    await staff.save({ session });

    await createAuditLog({
      user: actorUserId,
      action: 'salary.pay',
      resource: 'Staff',
      resourceId: staff._id,
      after: paidResult,
      req,
      session
    });

    return paidResult;
  });

export const getWorkingDaysInMonth = computeWorkingDaysInMonth;

export default {
  calculateMonthlySalary,
  payMonthlySalary,
  getWorkingDaysInMonth
};
