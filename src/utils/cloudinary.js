import { v2 as cloudinary } from 'cloudinary';
import env from '../../config/env.service.js';

let isConfigured = false;

const ensureConfigured = () => {
  if (isConfigured || !env.hasCloudinaryConfig) return;

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
  });

  isConfigured = true;
};

export const uploadBufferToCloudinary = async (buffer, { folder, publicId } = {}) => {
  if (!env.hasCloudinaryConfig) {
    throw new Error('Cloudinary is not configured');
  }

  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !env.hasCloudinaryConfig) return;

  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};
