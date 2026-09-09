const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

// GET /api/users  (Admin only)
exports.getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    results: users.length,
    data: { users },
  });
});

// GET /api/users/:id  (Auth required)
exports.getUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// PUT /api/users/:id  (Auth + Owner/Admin)
exports.updateUser = asyncWrapper(async (req, res, next) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return next(new AppError('User not found.', 404));
  }

  const isOwner = targetUser._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not allowed to update this profile.', 403));
  }

  const updates = { ...req.body };

  // Non-admins cannot change their own role
  if (!isAdmin) {
    delete updates.role;
  }

  // Handle uploaded avatar file, if any
  if (req.file) {
    updates.avatar = `/uploads/${req.file.filename}`;
  }

  // Hash password if it's being updated
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 12);
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser },
  });
});

// DELETE /api/users/:id  (Admin only)
exports.deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
