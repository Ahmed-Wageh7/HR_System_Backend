import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';
import env from '../../config/env.service.js';

const buildLimiter = ({ windowMs, max, keyGenerator, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      logger.warn('RATE_LIMIT_HIT', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      res.status(429).json({ status: 'fail', message });
    }
  });

export const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.'
});

export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: env.isDevelopment ? 100 : 20,
  message: 'Too many authentication attempts, please try again later.'
});

export const uploadLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many upload requests, please try again later.'
});

export const bulkLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many bulk operations, please try again later.'
});
