/**
 * Wraps an async controller/middleware function and forwards any
 * rejected promise / thrown error to Express's error-handling
 * middleware via next(err). Avoids repetitive try/catch blocks.
 */
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncWrapper;
