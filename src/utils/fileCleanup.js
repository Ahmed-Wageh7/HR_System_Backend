import fs from 'fs/promises';
import path from 'path';
import env from '../../config/env.service.js';
import { cleanupQueue } from '../common/queues.js';
import { deleteFromCloudinary } from './cloudinary.js';

export const enqueueFileCleanup = async (filePath) => {
  if (!filePath) return;
  const relativePath = path.relative(process.cwd(), filePath);
  if (env.enableQueues) {
    await cleanupQueue.add({ path: relativePath });
    return;
  }

  await fs.rm(path.join(process.cwd(), relativePath), { force: true });
};

export const cleanupStoredFile = async (file = {}) => {
  if (file.publicId) {
    await deleteFromCloudinary(file.publicId);
    return;
  }

  if (file.path) {
    await enqueueFileCleanup(file.path);
  }
};
