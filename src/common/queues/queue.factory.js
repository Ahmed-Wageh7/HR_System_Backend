import Bull from 'bull';
import env from '../../../config/env.service.js';

const redisConfig = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password || undefined
};

const createInlineQueue = (name) => {
  let processor;
  let jobId = 0;

  return {
    process(handler) {
      processor = handler;
    },
    async add(data) {
      const job = { id: `${name}-${++jobId}`, data };
      if (processor) {
        await processor(job);
      }
      return job;
    },
    on() {}
  };
};

export default (name) =>
  env.enableQueues
    ? new Bull(name, {
        redis: redisConfig,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      })
    : createInlineQueue(name);
