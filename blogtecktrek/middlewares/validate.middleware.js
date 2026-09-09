/**
 * Generic validation middleware factory.
 * Usage: validate(schema, 'body' | 'params' | 'query')
 *
 * Validates the given request property against a Joi schema.
 * On failure, responds with 400 and a list of readable error messages.
 * On success, replaces the request property with the validated
 * (and possibly type-coerced/defaulted) value.
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // collect all errors, not just the first
      stripUnknown: true, // remove fields not defined in the schema
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message.replace(/"/g, ''));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
