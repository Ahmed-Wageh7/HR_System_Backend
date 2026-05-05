import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import AuditLog from '../../src/model/auditLog.model.js';
import Staff from '../../src/model/staff.model.js';
import Attendance from '../../src/model/attendance.model.js';
import Deduction from '../../src/model/deduction.model.js';
import { restoreStaff } from '../../src/modules/v1/staff/staff.service.js';

const req = {
  user: { _id: 'user-id' },
  ip: '127.0.0.1',
  headers: { 'user-agent': 'node-test' }
};

const createSessionStub = () => ({
  startTransaction() {},
  async commitTransaction() {},
  async abortTransaction() {},
  endSession() {}
});

test('restoreStaff throws when staff is already restored', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = Staff.findById;

  mongoose.startSession = async () => createSessionStub();
  Staff.findById = () => ({
    setOptions() {
      return this;
    },
    session() {
      return Promise.resolve({
        _id: 'staff-id',
        isDeleted: false
      });
    }
  });

  try {
    await assert.rejects(
      restoreStaff('staff-id', req),
      (error) => error.message === 'Staff already restored' && error.statusCode === 400
    );
  } finally {
    mongoose.startSession = originalStartSession;
    Staff.findById = originalFindById;
  }
});

test('restoreStaff restores a deleted staff member and linked records', async () => {
  const originalStartSession = mongoose.startSession;
  const originalAuditCreate = AuditLog.create;
  const originalFindById = Staff.findById;
  const originalAttendanceUpdateMany = Attendance.updateMany;
  const originalDeductionUpdateMany = Deduction.updateMany;

  let attendanceUpdated = false;
  let deductionsUpdated = false;
  let savedWithSession = false;

  const staffDoc = {
    _id: 'staff-id',
    isDeleted: true,
    deletedAt: new Date(),
    async save() {
      savedWithSession = true;
      return this;
    }
  };

  mongoose.startSession = async () => createSessionStub();
  AuditLog.create = async () => [{}];
  Staff.findById = () => ({
    setOptions() {
      return this;
    },
    session() {
      return Promise.resolve(staffDoc);
    }
  });

  Attendance.updateMany = () => ({
    session() {
      attendanceUpdated = true;
      return Promise.resolve();
    }
  });

  Deduction.updateMany = () => ({
    session() {
      deductionsUpdated = true;
      return Promise.resolve();
    }
  });

  try {
    const result = await restoreStaff('staff-id', req);

    assert.equal(result.isDeleted, false);
    assert.equal(result.deletedAt, null);
    assert.equal(savedWithSession, true);
    assert.equal(attendanceUpdated, true);
    assert.equal(deductionsUpdated, true);
  } finally {
    mongoose.startSession = originalStartSession;
    AuditLog.create = originalAuditCreate;
    Staff.findById = originalFindById;
    Attendance.updateMany = originalAttendanceUpdateMany;
    Deduction.updateMany = originalDeductionUpdateMany;
  }
});
