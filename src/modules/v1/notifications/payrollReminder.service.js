import Message from '../../../model/message.model.js';
import logger from '../../../utils/logger.js';
import { emitToAdmins } from './socket.js';

let payrollReminderTimer;

export const getPayrollReminderReferenceKey = (date = new Date()) =>
  `payroll-reminder-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const isFirstDayOfMonth = (date = new Date()) => date.getDate() === 1;

export const buildPayrollReminderPayload = (date = new Date()) => {
  const monthLabel = date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return {
    type: 'payroll',
    targetRole: 'admin',
    title: 'Payroll Reminder',
    referenceKey: getPayrollReminderReferenceKey(date),
    message: `Please review and pay staff salaries for ${monthLabel}.`
  };
};

export const ensureMonthlyPayrollReminder = async (date = new Date()) => {
  if (!isFirstDayOfMonth(date)) return null;

  const payload = buildPayrollReminderPayload(date);
  const existing = await Message.findOne({ referenceKey: payload.referenceKey });
  if (existing) return existing;

  const created = await Message.create(payload);
  emitToAdmins('user:receive-message', {
    type: created.type,
    title: created.title,
    message: created.message,
    targetRole: created.targetRole,
    referenceKey: created.referenceKey
  });

  logger.info('PAYROLL_REMINDER_CREATED', { referenceKey: created.referenceKey });

  return created;
};

export const startPayrollReminderScheduler = () => {
  if (payrollReminderTimer) return payrollReminderTimer;

  ensureMonthlyPayrollReminder().catch((error) => {
    logger.error('PAYROLL_REMINDER_CHECK_FAILED', { message: error.message });
  });

  payrollReminderTimer = setInterval(() => {
    ensureMonthlyPayrollReminder().catch((error) => {
      logger.error('PAYROLL_REMINDER_CHECK_FAILED', { message: error.message });
    });
  }, 60 * 60 * 1000);

  return payrollReminderTimer;
};

export const stopPayrollReminderScheduler = () => {
  if (!payrollReminderTimer) return;
  clearInterval(payrollReminderTimer);
  payrollReminderTimer = undefined;
};

export default {
  buildPayrollReminderPayload,
  ensureMonthlyPayrollReminder,
  getPayrollReminderReferenceKey,
  isFirstDayOfMonth,
  startPayrollReminderScheduler,
  stopPayrollReminderScheduler
};
