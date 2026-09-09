const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/User.model');

/**
 * Protects routes: verifies the JWT sent in the Authorization header
 * (format: "Bearer TOKEN") and attaches the authenticated user's
 * payload to req.user. Responds 401 if missing/invalid/expired.
 */
const authenticate = asyncWrapper(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please provide a valid token.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }

  // Ensure the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = {
    id: currentUser._id.toString(),
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  };

  next();
});

module.exports = authenticate;
