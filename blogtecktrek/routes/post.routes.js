const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/post.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { createPostSchema, updatePostSchema } = require('../validations/post.validation');

// mergeParams allows this router to be nested under /api/posts/:postId/comments
const router = express.Router({ mergeParams: true });

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post(
  '/',
  authenticate,
  upload.single('coverImage'),
  validate(createPostSchema),
  createPost
);
router.put(
  '/:id',
  authenticate,
  upload.single('coverImage'),
  validate(updatePostSchema),
  updatePost
);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
