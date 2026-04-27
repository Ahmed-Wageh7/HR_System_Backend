import createQueue from './queue.factory.js';
import logger from '../../utils/logger.js';
import sendEmail from '../email/sendEmail.js';

const emailQueue = createQueue('email.queue');

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});

emailQueue.on('completed', (job) => {
  logger.info('EMAIL_JOB_COMPLETED', { id: job.id });
});

emailQueue.on('failed', (job, error) => {
  logger.error('EMAIL_JOB_FAILED', { id: job?.id, message: error.message });
});

export default emailQueue;
