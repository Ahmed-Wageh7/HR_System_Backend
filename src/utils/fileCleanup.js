import path from 'path';
import { cleanupQueue } from '../common/queues.js';

export const enqueueFileCleanup = async (filePath) => {
  if (!filePath) return;
  const relativePath = path.relative(process.cwd(), filePath);
  await cleanupQueue.add({ path: relativePath });
};
