import Joi from 'joi';

export const createLeaveSchema = Joi.object({
  reason: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required()
});

export const reviewLeaveSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reviewNote: Joi.string().allow('', null)
});

export default {
  createLeaveSchema,
  reviewLeaveSchema
};
