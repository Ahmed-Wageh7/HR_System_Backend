import env from '../config/env.service.js';
import connectDatabase from './database/connection.js';
import syncIndexes from './database/indexes.js';
import seedDatabase from './database/seed.js';
import { initQueues } from './common/queues.js';

let bootstrapPromise;

export const bootstrapApp = async () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await connectDatabase();

    if (env.runDbSyncOnBoot) {
      await syncIndexes();
    }

    if (env.runDbSeedOnBoot) {
      await seedDatabase();
    }

    if (env.enableQueues) {
      await initQueues();
    }
  })().catch((error) => {
    bootstrapPromise = undefined;
    throw error;
  });

  return bootstrapPromise;
};

export default bootstrapApp;
