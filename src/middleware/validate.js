import AppError from '../utils/AppError.js';

export default (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return next(new AppError(error.details.map((item) => item.message).join(', '), 400));
  }

  req[property] = value;
  return next();
};
