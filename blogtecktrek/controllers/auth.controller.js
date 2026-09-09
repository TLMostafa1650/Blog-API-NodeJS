const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// POST /api/auth/register
exports.register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists.', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    data: { user: sanitizeUser(newUser) },
  });
});

// POST /api/auth/login
exports.login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    data: { user: sanitizeUser(user) },
  });
});
