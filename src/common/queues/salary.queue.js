import createQueue from './queue.factory.js';
import logger from '../../utils/logger.js';

const salaryQueue = createQueue('salary.queue');

salaryQueue.process(async () => {
  logger.info('SALARY_JOB_PLACEHOLDER');
});

salaryQueue.on('completed', (job) => {
  logger.info('SALARY_JOB_COMPLETED', { id: job.id });
});

salaryQueue.on('failed', (job, error) => {
  logger.error('SALARY_JOB_FAILED', { id: job?.id, message: error.message });
});

export default salaryQueue;
