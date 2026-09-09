const express = require('express');
const { createComment, deleteComment } = require('../controllers/comment.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCommentSchema } = require('../validations/comment.validation');

// Router for nested route: POST /api/posts/:postId/comments
const nestedCommentRouter = express.Router({ mergeParams: true });
nestedCommentRouter.post('/', authenticate, validate(createCommentSchema), createComment);

// Router for standalone route: DELETE /api/comments/:id
const commentRouter = express.Router();
commentRouter.delete('/:id', authenticate, deleteComment);

module.exports = { nestedCommentRouter, commentRouter };
