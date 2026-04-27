import logger from '../utils/logger.js';

export default (err, req, res, next) => {
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
