import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

export default (err, req, res, next) => {
  if (err?.name === 'ValidationError') {
    err = new AppError(Object.values(err.errors).map((item) => item.message).join(', '), 400);
  }

  if (err?.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    err = new AppError(`${field} already exists`, 409);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 400;
    err.status = 'fail';
    err.message = 'Uploaded file exceeds the maximum allowed size';
    err.isOperational = true;
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  logger.error('UNHANDLED ERROR', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};
