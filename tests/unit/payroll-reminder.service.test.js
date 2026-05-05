import test from 'node:test';
import assert from 'node:assert/strict';
import Message from '../../src/model/message.model.js';
import {
  buildPayrollReminderPayload,
  ensureMonthlyPayrollReminder,
  getPayrollReminderReferenceKey,
  isFirstDayOfMonth,
  stopPayrollReminderScheduler
} from '../../src/modules/v1/notifications/payrollReminder.service.js';

test('detects the first day of the month', () => {
  assert.equal(isFirstDayOfMonth(new Date('2026-05-01T09:00:00Z')), true);
  assert.equal(isFirstDayOfMonth(new Date('2026-05-02T09:00:00Z')), false);
});

test('builds a stable payroll reminder key and payload', () => {
  const date = new Date('2026-05-01T09:00:00Z');
  const payload = buildPayrollReminderPayload(date);

  assert.equal(getPayrollReminderReferenceKey(date), 'payroll-reminder-2026-05');
  assert.equal(payload.type, 'payroll');
  assert.equal(payload.targetRole, 'admin');
  assert.equal(payload.title, 'Payroll Reminder');
  assert.equal(payload.referenceKey, 'payroll-reminder-2026-05');
  assert.match(payload.message, /May 2026/);
});

test('creates the monthly payroll reminder only once', async () => {
  const originalFindOne = Message.findOne;
  const originalCreate = Message.create;

  const createdMessages = [];
  Message.findOne = async ({ referenceKey }) =>
    createdMessages.find((message) => message.referenceKey === referenceKey) || null;
  Message.create = async (payload) => {
    const created = { ...payload, _id: `${payload.referenceKey}-id` };
    createdMessages.push(created);
    return created;
  };

  try {
    const date = new Date('2026-05-01T09:00:00Z');
    const first = await ensureMonthlyPayrollReminder(date);
    const second = await ensureMonthlyPayrollReminder(date);

    assert.equal(createdMessages.length, 1);
    assert.equal(first.referenceKey, 'payroll-reminder-2026-05');
    assert.equal(second.referenceKey, 'payroll-reminder-2026-05');
  } finally {
    Message.findOne = originalFindOne;
    Message.create = originalCreate;
    stopPayrollReminderScheduler();
  }
});

test('does nothing when the date is not the first day of the month', async () => {
  const originalFindOne = Message.findOne;
  const originalCreate = Message.create;

  let touchedStore = false;
  Message.findOne = async () => {
    touchedStore = true;
    return null;
  };
  Message.create = async () => {
    touchedStore = true;
    return {};
  };

  try {
    const result = await ensureMonthlyPayrollReminder(new Date('2026-05-02T09:00:00Z'));

    assert.equal(result, null);
    assert.equal(touchedStore, false);
  } finally {
    Message.findOne = originalFindOne;
    Message.create = originalCreate;
    stopPayrollReminderScheduler();
  }
});
