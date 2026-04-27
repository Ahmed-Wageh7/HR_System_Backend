import fs from 'fs/promises';
import path from 'path';
import createQueue from './queue.factory.js';
import logger from '../../utils/logger.js';

const cleanupQueue = createQueue('cleanup.queue');

cleanupQueue.process(async (job) => {
  const filePath = path.join(process.cwd(), job.data.path);
  await fs.rm(filePath, { force: true });
});

cleanupQueue.on('failed', (job, error) => {
  logger.error('CLEANUP_JOB_FAILED', { id: job?.id, message: error.message });
});

export default cleanupQueue;
