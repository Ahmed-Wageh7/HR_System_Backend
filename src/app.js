import express from 'express';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import env from '../config/env.service.js';
import AppError from './utils/AppError.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import v1Router from './modules/v1/index.js';
import path from 'path';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(requestLogger);
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookie.secret));
app.use(mongoSanitize());
if (!env.useCloudinaryUploads) {
  app.use('/uploads', express.static(path.join(process.cwd(), env.upload.dir)));
}
const csrfExcludedRoutes = new Set([
  'POST /api/v1/auth/signup',
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/forgot-password',
  'POST /api/v1/auth/reset-password',
  'POST /api/auth/signup',
  'POST /api/auth/login',
  'POST /api/auth/forgot-password',
  'POST /api/auth/reset-password'
]);

const issueCsrfToken = (res) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');

  res.cookie(env.cookie.csrfName, csrfToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: env.isProduction
  });

  return csrfToken;
};

const validateCsrfToken = (req, res, next) => {
  const cookieToken = req.cookies?.[env.cookie.csrfName];
  const requestToken =
    req.get('x-csrf-token') || req.get('x-xsrf-token') || req.body?._csrf || req.query?._csrf;

  if (!cookieToken || !requestToken) {
    return next(new AppError('Invalid CSRF token', 403));
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const requestBuffer = Buffer.from(requestToken);

  if (
    cookieBuffer.length !== requestBuffer.length ||
    !crypto.timingSafeEqual(cookieBuffer, requestBuffer)
  ) {
    return next(new AppError('Invalid CSRF token', 403));
  }

  return next();
};

app.get('/api/csrf-token', (req, res) => {
  const csrfToken = issueCsrfToken(res);
  res.status(200).json({ status: 'success', data: { csrfToken } });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `${env.appName} backend is running`
  });
});

app.use((req, res, next) => {
  const requestKey = `${req.method} ${req.baseUrl}${req.path}`;

  if ([...csrfExcludedRoutes].some((route) => requestKey.startsWith(route))) {
    return next();
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return validateCsrfToken(req, res, next);
  }
  return next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', data: { uptime: process.uptime() } });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `${env.appName} backend is running`
  });
});

app.use('/api/v1', v1Router);
app.use('/api', v1Router);

app.use('/api/:version', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `API version ${req.params.version} does not exist`
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
