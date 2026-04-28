import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import env from '../../../../config/env.service.js';
import AppError from '../../../utils/AppError.js';

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const storage = env.useCloudinaryUploads
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const date = new Date();
        const dir = path.join(
          process.cwd(),
          env.uploadDir,
          req.uploadResource || 'misc',
          String(date.getFullYear()),
          String(date.getMonth() + 1).padStart(2, '0')
        );

        ensureDir(dir);
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}-${Date.now()}${extension}`);
      }
    });

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!allowedMimes.includes(file.mimetype) || !allowedExt.includes(ext)) {
    return cb(new AppError('Only jpg, png, and webp files are allowed', 400));
  }
  return cb(null, true);
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSize }
});
