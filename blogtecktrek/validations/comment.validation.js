const Joi = require('joi');

const createCommentSchema = Joi.object({
  text: Joi.string().min(1).required().messages({
    'string.min': 'Comment text cannot be empty',
    'any.required': 'Comment text is required',
  }),
});

module.exports = { createCommentSchema };
