import mongoose from 'mongoose';
import env from '../../config/env.service.js';
import logger from '../utils/logger.js';

const isAtlasUri = (uri = '') => uri.startsWith('mongodb+srv://');

const getConnectOptions = (uri) => {
  if (env.isDevelopment && isAtlasUri(uri)) {
    return { serverSelectionTimeoutMS: 5000 };
  }

  return {};
};

export default async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, getConnectOptions(env.mongoUri));
    logger.info(`MongoDB connected: ${env.mongoUri}`);
  } catch (error) {
    const canFallbackToLocal =
      env.isDevelopment &&
      env.mongoUri !== env.mongoLocalUri &&
      isAtlasUri(env.mongoUri) &&
      env.mongoLocalUri;

    if (!canFallbackToLocal) {
      throw error;
    }

    logger.warn(
      `Primary MongoDB connection failed (${error.message}). Retrying local MongoDB at ${env.mongoLocalUri}`
    );

    await mongoose.connect(env.mongoLocalUri);
    logger.info(`MongoDB connected: ${env.mongoLocalUri}`);
  }
};
