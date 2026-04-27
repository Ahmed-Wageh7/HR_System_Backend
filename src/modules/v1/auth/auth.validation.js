import Joi from 'joi';

const password = Joi.string()
  .min(8)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[0-9]/, 'number')
  .required();

export const signupSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password,
  phone: Joi.string().allow('', null)
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  password
});

export default {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
