import Joi from 'joi';

export const profileSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().allow('', null)
});

export default {
  profileSchema
};
