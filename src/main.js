import http from 'http';
import app from './app.js';
import env from '../config/env.service.js';
import connectDatabase from './database/connection.js';
import syncIndexes from './database/indexes.js';
import seedDatabase from './database/seed.js';
import { initSocket } from './modules/v1/notifications/socket.js';
import { initQueues } from './common/queues.js';

const start = async () => {
  await connectDatabase();
  await syncIndexes();
  await seedDatabase();
  initQueues();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`${env.appName} listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.log('BOOTSTRAP_FAILED', { message: error.message, stack: error.stack });
  process.exit(1);
});
