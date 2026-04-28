import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import env from '../../config/env.service.js';
import { uploadBufferToCloudinary } from './cloudinary.js';

const normalizeRelativePath = (filePath) =>
  path.relative(process.cwd(), filePath).split(path.sep).join('/');

export const persistUploadedFile = async (file, folder = 'misc') => {
  if (!file) return null;

  if (file.buffer) {
    const publicId = `${folder}/${uuidv4()}-${Date.now()}`;
    const uploaded = await uploadBufferToCloudinary(file.buffer, {
      folder: env.appName.toLowerCase().replace(/\s+/g, '-'),
      publicId
    });

    return {
      name: file.originalname,
      mimeType: file.mimetype,
      path: uploaded.secure_url,
      url: uploaded.secure_url,
      publicId: uploaded.public_id
    };
  }

  const relativePath = normalizeRelativePath(file.path);

  return {
    name: file.filename || file.originalname,
    mimeType: file.mimetype,
    path: relativePath,
    url: `/${relativePath}`,
    publicId: file.filename
  };
};
