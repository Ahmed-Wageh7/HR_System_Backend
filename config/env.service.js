import path from 'path';
import dotenv from 'dotenv';
import { parseAllowedOrigins } from '../src/utils/cors.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const toNumber = (value, def) => {
  const n = Number(value);
  return isNaN(n) ? def : n;
};

const configuredClientOrigins = parseAllowedOrigins(process.env.CLIENT_URL || 'http://localhost:3000');
const configuredAllowedOrigins = parseAllowedOrigins(
  process.env.ALLOWED_ORIGINS || process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL
);

const env = {
  port: toNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'HR Management System',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  clientUrl: configuredClientOrigins[0] || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_system',
  mongoLocalUri: process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/hr_system',
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '10s'
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    refreshName: process.env.COOKIE_REFRESH_NAME || 'refreshToken'
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  emailFrom: process.env.EMAIL_FROM || 'no-reply@hr-system.local',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: toNumber(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || ''
  },
  upload: {
    maxFileSize: toNumber(process.env.MAX_FILE_SIZE, 5242880),
    dir: process.env.UPLOAD_DIR || 'uploads'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  vercelUrl: process.env.VERCEL_URL
};

env.isProduction = env.nodeEnv === 'production';
env.isDevelopment = env.nodeEnv === 'development';
env.isVercel = process.env.VERCEL === '1' || Boolean(env.vercelUrl);
env.isServerless = env.isVercel || process.env.SERVERLESS === 'true';
env.allowedOrigins = configuredAllowedOrigins.length
  ? configuredAllowedOrigins
  : configuredClientOrigins;
env.hasCloudinaryConfig = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);
env.useCloudinaryUploads = env.hasCloudinaryConfig && (env.isProduction || env.isServerless);
env.enableQueues =
  process.env.ENABLE_QUEUES !== undefined
    ? process.env.ENABLE_QUEUES === 'true'
    : !env.isServerless;
env.enableSockets =
  process.env.ENABLE_SOCKETS !== undefined
    ? process.env.ENABLE_SOCKETS === 'true'
    : !env.isServerless;
env.runDbSyncOnBoot =
  process.env.RUN_DB_SYNC_ON_BOOT !== undefined
    ? process.env.RUN_DB_SYNC_ON_BOOT === 'true'
    : !env.isServerless;
env.runDbSeedOnBoot =
  process.env.RUN_DB_SEED_ON_BOOT !== undefined
    ? process.env.RUN_DB_SEED_ON_BOOT === 'true'
    : !env.isServerless;

// Backward-compatible aliases for older code paths that still use flat env names.
env.jwtSecret = env.jwt.secret;
env.jwtExpire = env.jwt.expire;
env.jwtRefreshSecret = env.jwtRefresh.secret;
env.jwtRefreshExpire = env.jwtRefresh.expire;
env.cookieSecret = env.cookie.secret;
env.cookieRefreshName = env.cookie.refreshName;
env.smtpHost = env.smtp.host;
env.smtpPort = env.smtp.port;
env.smtpUser = env.smtp.user;
env.smtpPass = env.smtp.pass;
env.redisHost = env.redis.host;
env.redisPort = env.redis.port;
env.redisPassword = env.redis.password;
env.maxFileSize = env.upload.maxFileSize;
env.uploadDir = env.upload.dir;
env.cloudinaryCloudName = env.cloudinary.cloudName;
env.cloudinaryApiKey = env.cloudinary.apiKey;
env.cloudinaryApiSecret = env.cloudinary.apiSecret;

if (!env.jwt.secret) throw new Error('JWT_SECRET is required');
if (!env.jwtRefresh.secret) throw new Error('JWT_REFRESH_SECRET is required');
if (!env.cookie.secret) throw new Error('COOKIE_SECRET is required');

if (env.isProduction) {
  if (!env.smtp.host) throw new Error('SMTP_HOST is required in production');
  if (env.isServerless && !env.hasCloudinaryConfig) {
    throw new Error('Cloudinary configuration is required for serverless production uploads');
  }
}

env.cookies = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export default env;
