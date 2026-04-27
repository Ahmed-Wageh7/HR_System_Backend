import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import csrf from 'csurf';
import env from '../config/env.service.js';
import AppError from './utils/AppError.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import v1Router from './modules/v1/index.js';
import path from 'path';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(helmet());
app.use(requestLogger);
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookie.secret));
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(process.cwd(), env.upload.dir)));
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    sameSite: 'strict',
    secure: env.isProduction
  }
});
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

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.cookie(env.cookie.csrfName, req.csrfToken(), {
    httpOnly: false,
    sameSite: 'strict',
    secure: env.isProduction
  });

  res.status(200).json({ status: 'success', data: { csrfToken: req.csrfToken() } });
});

app.use((req, res, next) => {
  const requestKey = `${req.method} ${req.baseUrl}${req.path}`;

  if ([...csrfExcludedRoutes].some((route) => requestKey.startsWith(route))) {
    return next();
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return csrfProtection(req, res, next);
  }
  return next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', data: { uptime: process.uptime() } });
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
