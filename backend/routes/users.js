const express = require('express');
const { check } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  banUser,
  getUserStats,
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(
    advancedResults(User, {
      path: 'posts',
      select: 'title createdAt',
    }),
    getUsers
  )
  .post(
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Please enter a password with 6 or more characters'
      ).isLength({ min: 6 }),
    ],
    createUser
  );

router.get('/stats', getUserStats);

router
  .route('/:id')
  .get(getUser)
  .put(
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
    ],
    updateUser
  )
  .delete(deleteUser);

router.put('/:id/ban', banUser);

module.exports = router;
