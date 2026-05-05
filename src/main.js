import http from 'http';
import app from './app.js';
import env from '../config/env.service.js';
import bootstrapApp from './bootstrap.js';
import { initSocket } from './modules/v1/notifications/socket.js';
import { startPayrollReminderScheduler } from './modules/v1/notifications/payrollReminder.service.js';

const start = async () => {
  await bootstrapApp();

  const server = http.createServer(app);
  if (env.enableSockets) {
    initSocket(server);
  }

  if (!env.isServerless) {
    startPayrollReminderScheduler();
  }

  server.listen(env.port, () => {
    console.log(`${env.appName} listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.log('BOOTSTRAP_FAILED', { message: error.message, stack: error.stack });
  process.exit(1);
});
