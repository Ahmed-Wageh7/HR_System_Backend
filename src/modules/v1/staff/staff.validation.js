import Joi from 'joi';

export const createStaffSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  dailySalary: Joi.number().positive().required(),
  joinDate: Joi.date().optional(),
  department: Joi.string().hex().length(24).allow(null, ''),
  position: Joi.string().allow('', null)
});

export const updateStaffSchema = Joi.object({
  dailySalary: Joi.number().positive(),
  joinDate: Joi.date(),
  department: Joi.string().hex().length(24).allow(null, ''),
  position: Joi.string().allow('', null),
  isActive: Joi.boolean()
});

export const deductionSchema = Joi.object({
  month: Joi.string().required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().required()
});

export const salaryAdjustSchema = Joi.object({
  adjustments: Joi.number().required()
});

export default {
  createStaffSchema,
  updateStaffSchema,
  deductionSchema,
  salaryAdjustSchema
};
