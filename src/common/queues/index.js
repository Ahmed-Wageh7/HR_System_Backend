export { default as emailQueue } from './email.queue.js';
export { default as salaryQueue } from './salary.queue.js';
export { default as absentQueue } from './absent.queue.js';
export { default as cleanupQueue } from './cleanup.queue.js';

export const initQueues = async () => import('./index.js');
