import createQueue from './queue.factory.js';
import logger from '../../utils/logger.js';
import { payMonthlySalary } from '../../modules/v1/salary/salary.service.js';

const salaryQueue = createQueue('salary.queue');

salaryQueue.process(async (job) => {
  const { staffId, month } = job.data;

  const result = await payMonthlySalary(staffId, month, {
    allowAlreadyPaid: true,
    req: {
      ip: 'queue',
      headers: { 'user-agent': 'salary-queue' }
    }
  });

  logger.info('SALARY_JOB_PROCESSED', {
    id: job.id,
    staffId,
    month,
    finalSalary: result.finalSalary
  });
});

salaryQueue.on('completed', (job) => {
  logger.info('SALARY_JOB_COMPLETED', { id: job.id });
});

salaryQueue.on('failed', (job, error) => {
  logger.error('SALARY_JOB_FAILED', { id: job?.id, message: error.message });
});

export default salaryQueue;
