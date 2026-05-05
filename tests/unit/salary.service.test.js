import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import AuditLog from '../../src/model/auditLog.model.js';
import Staff from '../../src/model/staff.model.js';
import Attendance from '../../src/model/attendance.model.js';
import Deduction from '../../src/model/deduction.model.js';
import Leave from '../../src/model/leave.model.js';
import {
  calculateMonthlySalary,
  getWorkingDaysInMonth,
  payMonthlySalary
} from '../../src/modules/v1/salary/salary.service.js';

const createSessionStub = () => ({
  startTransaction() {},
  async commitTransaction() {},
  async abortTransaction() {},
  endSession() {}
});

test('returns working days for a month excluding Friday and Saturday', () => {
  assert.ok(getWorkingDaysInMonth('2026-04') > 0);
  assert.equal(getWorkingDaysInMonth('2026-04'), 22);
});

test('returns stored paid monthly report instead of recalculating salary', async () => {
  const originalFindById = Staff.findById;
  const originalAttendanceFind = Attendance.find;
  const originalDeductionFind = Deduction.find;
  const originalLeaveFind = Leave.find;

  Staff.findById = async () => ({
    dailySalary: 600,
    monthlyReports: [
      {
        month: '2026-04',
        totalDaysWorked: 1,
        lateDays: 0,
        absentDays: 20,
        totalDeductions: 12000,
        adjustments: 2000,
        finalSalary: 2600,
        isPaid: true
      }
    ]
  });

  Attendance.find = async () => {
    throw new Error('attendance should not be queried for paid reports');
  };
  Deduction.find = async () => {
    throw new Error('deductions should not be queried for paid reports');
  };
  Leave.find = async () => {
    throw new Error('leaves should not be queried for paid reports');
  };

  try {
    const result = await calculateMonthlySalary('staff-id', '2026-04');

    assert.deepEqual(result, {
      totalDaysWorked: 1,
      lateDays: 0,
      absentDays: 20,
      totalDeductions: 12000,
      adjustments: 2000,
      finalSalary: 2600,
      isPaid: true
    });
  } finally {
    Staff.findById = originalFindById;
    Attendance.find = originalAttendanceFind;
    Deduction.find = originalDeductionFind;
    Leave.find = originalLeaveFind;
  }
});

test('payMonthlySalary stores the month as paid', async () => {
  const originalStartSession = mongoose.startSession;
  const originalAuditCreate = AuditLog.create;
  const originalFindById = Staff.findById;
  const originalAttendanceFind = Attendance.find;
  const originalDeductionFind = Deduction.find;
  const originalLeaveFind = Leave.find;

  let saveCalled = false;
  const staffDoc = {
    _id: 'staff-id',
    dailySalary: 600,
    monthlyReports: [],
    async save() {
      saveCalled = true;
      return this;
    }
  };
  let findByIdCalls = 0;

  mongoose.startSession = async () => createSessionStub();
  AuditLog.create = async () => [{}];
  Staff.findById = () => {
    findByIdCalls += 1;

    if (findByIdCalls === 1) {
      return Promise.resolve(staffDoc);
    }

    return {
      setOptions() {
        return this;
      },
      session() {
        return Promise.resolve(staffDoc);
      }
    };
  };
  Attendance.find = async () => [];
  Deduction.find = async () => [];
  Leave.find = async () => [];

  try {
    const result = await payMonthlySalary('staff-id', '2026-04', {
      actorUserId: 'user-id',
      req: {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'node-test' }
      }
    });

    assert.equal(result.isPaid, true);
    assert.equal(saveCalled, true);
    assert.equal(staffDoc.monthlyReports.length, 1);
    assert.equal(staffDoc.monthlyReports[0].month, '2026-04');
    assert.equal(staffDoc.monthlyReports[0].isPaid, true);
    assert.ok(staffDoc.monthlyReports[0].paidAt instanceof Date);
  } finally {
    mongoose.startSession = originalStartSession;
    AuditLog.create = originalAuditCreate;
    Staff.findById = originalFindById;
    Attendance.find = originalAttendanceFind;
    Deduction.find = originalDeductionFind;
    Leave.find = originalLeaveFind;
  }
});

test('payMonthlySalary allows already-paid months for queue jobs', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = Staff.findById;

  const paidReport = {
    month: '2026-04',
    totalDaysWorked: 1,
    lateDays: 0,
    absentDays: 20,
    totalDeductions: 12000,
    adjustments: 2000,
    finalSalary: 2600,
    isPaid: true
  };

  mongoose.startSession = async () => createSessionStub();
  let findByIdCalls = 0;
  Staff.findById = () => {
    findByIdCalls += 1;

    if (findByIdCalls === 1) {
      return Promise.resolve({
        _id: 'staff-id',
        dailySalary: 600,
        monthlyReports: [paidReport]
      });
    }

    return {
      setOptions() {
        return this;
      },
      session() {
        return Promise.resolve({
          _id: 'staff-id',
          dailySalary: 600,
          monthlyReports: [paidReport]
        });
      }
    };
  };

  try {
    const result = await payMonthlySalary('staff-id', '2026-04', {
      allowAlreadyPaid: true
    });

    assert.deepEqual(result, {
      totalDaysWorked: 1,
      lateDays: 0,
      absentDays: 20,
      totalDeductions: 12000,
      adjustments: 2000,
      finalSalary: 2600,
      isPaid: true
    });
  } finally {
    mongoose.startSession = originalStartSession;
    Staff.findById = originalFindById;
  }
});
