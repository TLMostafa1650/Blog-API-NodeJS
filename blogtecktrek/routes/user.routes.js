const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const restrictTo = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { updateUserSchema } = require('../validations/user.validation');

const router = express.Router();

router.get('/', authenticate, restrictTo('admin'), getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put(
  '/:id',
  authenticate,
  upload.single('avatar'),
  validate(updateUserSchema),
  updateUser
);
router.delete('/:id', authenticate, restrictTo('admin'), deleteUser);

module.exports = router;
