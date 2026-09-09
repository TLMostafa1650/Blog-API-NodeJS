const Joi = require('joi');

// Used for PUT /api/users/:id — all fields optional, but at least one required
const updateUserSchema = Joi.object({
  name: Joi.string().min(3).messages({
    'string.min': 'Name must be at least 3 characters long',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
  avatar: Joi.string().allow(null, ''),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

module.exports = { updateUserSchema };
