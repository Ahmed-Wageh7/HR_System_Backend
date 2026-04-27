import createQueue from './queue.factory.js';
import logger from '../../utils/logger.js';

const absentQueue = createQueue('absent.queue');

absentQueue.process(async () => {
  logger.info('ABSENT_JOB_PLACEHOLDER');
});

export default absentQueue;
