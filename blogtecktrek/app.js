const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const AppError = require('./utils/AppError');
const errorMiddleware = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const { nestedCommentRouter, commentRouter } = require('./routes/comment.routes');

const app = express();

// ---- Global middlewares ----
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (avatars, cover images) statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Health check ----
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Blog API is running' });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Nested comment route: POST /api/posts/:postId/comments
app.use('/api/posts/:postId/comments', nestedCommentRouter);

// Standalone comment route: DELETE /api/comments/:id
app.use('/api/comments', commentRouter);

// ---- 404 handler for unmatched routes ----
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ---- Centralized error handler (must be last) ----
app.use(errorMiddleware);

module.exports = app;
