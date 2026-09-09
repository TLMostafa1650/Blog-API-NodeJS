const AppError = require('../utils/AppError');

/**
 * Restricts a route to one or more roles.
 * Usage: restrictTo('admin')  or  restrictTo('admin', 'user')
 * Must run AFTER the `authenticate` middleware (relies on req.user).
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = restrictTo;
