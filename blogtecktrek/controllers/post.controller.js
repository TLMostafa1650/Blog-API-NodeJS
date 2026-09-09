const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

// POST /api/posts  (Auth required, Joi validated, supports image upload)
exports.createPost = asyncWrapper(async (req, res, next) => {
  const { title, content, category, tags, isPublished } = req.body;

  const postData = {
    title,
    content,
    category,
    author: req.user.id,
  };

  if (tags) {
    postData.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  }

  if (typeof isPublished !== 'undefined') {
    postData.isPublished = isPublished;
  }

  if (req.file) {
    postData.coverImage = `/uploads/${req.file.filename}`;
  }

  const post = await Post.create(postData);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post },
  });
});

// GET /api/posts  (Public, pagination, search, category filter, sorting)
exports.getAllPosts = asyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search, category, author, sort } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (author) filter.author = author;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  let sortBy = '-createdAt';
  if (sort) {
    sortBy = sort.split(',').join(' ');
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: posts.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data: { posts },
  });
});

// GET /api/posts/:id  (Public, populated author + comments)
exports.getPostById = asyncWrapper(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email avatar');

  if (!post) {
    return next(new AppError('Post not found.', 404));
  }

  const comments = await Comment.find({ post: post._id })
    .populate('user', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: { post, comments },
  });
});

// PUT /api/posts/:id  (Auth required, Owner/Admin only, Joi validated)
exports.updatePost = asyncWrapper(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found.', 404));
  }

  const isOwner = post.author.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not allowed to update this post.', 403));
  }

  const updates = { ...req.body };

  if (updates.tags && !Array.isArray(updates.tags)) {
    updates.tags = updates.tags.split(',').map((t) => t.trim());
  }

  if (req.file) {
    updates.coverImage = `/uploads/${req.file.filename}`;
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('author', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: { post: updatedPost },
  });
});

// DELETE /api/posts/:id  (Auth required, Owner/Admin only)
exports.deletePost = asyncWrapper(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found.', 404));
  }

  const isOwner = post.author.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not allowed to delete this post.', 403));
  }

  await Post.findByIdAndDelete(req.params.id);
  // Clean up related comments
  await Comment.deleteMany({ post: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});
