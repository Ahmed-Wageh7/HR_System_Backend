import Bull from 'bull';
import env from '../../../config/env.service.js';

const redisConfig = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password || undefined
};

export default (name) =>
  new Bull(name, {
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
  });
