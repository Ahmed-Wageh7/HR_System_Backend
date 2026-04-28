import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import env from '../../config/env.service.js';

const logDir = path.join(process.cwd(), 'logs');
const loggerTransports = [
  new transports.Console({
    format: env.isProduction
      ? format.combine(format.timestamp(), format.json())
      : format.combine(format.colorize({ all: true }), format.simple())
  })
];

if (!env.isServerless) {
  loggerTransports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
}

const logger = createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: { service: 'hr-management-system' },
  transports: loggerTransports
});

export default logger;
