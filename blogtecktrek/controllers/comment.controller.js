const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

// POST /api/posts/:postId/comments  (Auth required, Joi validated)
exports.createComment = asyncWrapper(async (req, res, next) => {
  const { postId } = req.params;
  const { text } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post not found.', 404));
  }

  const comment = await Comment.create({
    text,
    user: req.user.id,
    post: postId,
  });

  const populatedComment = await comment.populate('user', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: { comment: populatedComment },
  });
});

// DELETE /api/comments/:id  (Auth required, Owner/Admin only)
exports.deleteComment = asyncWrapper(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found.', 404));
  }

  const isOwner = comment.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not allowed to delete this comment.', 403));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});
