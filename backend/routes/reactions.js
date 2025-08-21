const express = require('express');
const { check } = require('express-validator');
const {
  addOrUpdateReaction,
  getReactions,
  removeReaction,
} = require('../controllers/reactions');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  next();
});

// Public route to get reactions for a post
router.get('/', (req, res, next) => {
  console.log('GET /reactions called with postId:', req.params.postId);
  next();
}, getReactions);

// Apply protect middleware to all other routes
router.use((req, res, next) => {
  console.log('Applying protect middleware for path:', req.path);
  next();
}, protect);

// Add or update a reaction
router.route('/')
  .put(
    [
      check('type', 'Please provide a valid reaction type')
        .isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry']),
    ],
    (req, res, next) => {
      console.log('PUT /reactions called with:', {
        params: req.params,
        body: req.body,
        user: req.user ? req.user.id : 'No user'
      });
      next();
    },
    addOrUpdateReaction
  )
  .delete((req, res, next) => {
    console.log('DELETE /reactions called with:', {
      params: req.params,
      user: req.user ? req.user.id : 'No user'
    });
    next();
  }, removeReaction);

module.exports = router;
