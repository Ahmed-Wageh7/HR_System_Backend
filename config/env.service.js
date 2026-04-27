import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const toNumber = (value, def) => {
  const n = Number(value);
  return isNaN(n) ? def : n;
};

const env = {
  port: toNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'HR Management System',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_system',
  mongoLocalUri: process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/hr_system',
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '15m'
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    refreshName: process.env.COOKIE_REFRESH_NAME || 'refreshToken',
    csrfName: process.env.COOKIE_CSRF_NAME || 'XSRF-TOKEN'
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
  }
};

env.isProduction = env.nodeEnv === 'production';
env.isDevelopment = env.nodeEnv === 'development';

// Backward-compatible aliases for older code paths that still use flat env names.
env.jwtSecret = env.jwt.secret;
env.jwtExpire = env.jwt.expire;
env.jwtRefreshSecret = env.jwtRefresh.secret;
env.jwtRefreshExpire = env.jwtRefresh.expire;
env.cookieSecret = env.cookie.secret;
env.cookieRefreshName = env.cookie.refreshName;
env.cookieCsrfName = env.cookie.csrfName;
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
  if (!env.cloudinary.cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is required in production');
}

env.cookies = {
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction
};

export default env;
