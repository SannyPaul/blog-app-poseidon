const express = require('express');
const { check } = require('express-validator');
const {
  getComments,
  getCommentReplies,
  addComment,
  addReply,
  updateComment,
  deleteComment,
} = require('../controllers/comments');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getComments);
router.get('/:commentId/replies', getCommentReplies);

// Protected routes
router.use(protect);

router.post(
  '/',
  [check('content', 'Please add a comment').not().isEmpty()],
  addComment
);

router.post(
  '/:commentId/replies',
  [check('content', 'Please add a reply').not().isEmpty()],
  addReply
);

router
  .route('/:id')
  .put(
    [check('content', 'Please add a comment').not().isEmpty()],
    updateComment
  )
  .delete(deleteComment);

module.exports = router;
