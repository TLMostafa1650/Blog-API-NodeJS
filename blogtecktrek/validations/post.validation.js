const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().min(5).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'any.required': 'Title is required',
  }),
  content: Joi.string().min(10).required().messages({
    'string.min': 'Content must be at least 10 characters long',
    'any.required': 'Content is required',
  }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
  isPublished: Joi.boolean().optional(),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(5).messages({
    'string.min': 'Title must be at least 5 characters long',
  }),
  content: Joi.string().min(10).messages({
    'string.min': 'Content must be at least 10 characters long',
  }),
  category: Joi.string(),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  isPublished: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

module.exports = { createPostSchema, updatePostSchema };
