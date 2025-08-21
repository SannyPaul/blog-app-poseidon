const express = require('express');
const { check } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
  postPhotoUpload,
} = require('../controllers/posts');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/slug/:slug', getPost);
router.get('/user/:userId', getPostsByUser);

// Apply protect middleware to all routes below
router.use(protect);

// Regular user routes
router.post(
  '/',
  [
    check('title', 'Please add a title').not().isEmpty(),
    check('content', 'Please add content').not().isEmpty(),
  ],
  createPost
);

router.put(
  '/:id',
  [
    check('title', 'Please add a title').optional().not().isEmpty(),
    check('content', 'Please add content').optional().not().isEmpty(),
  ],
  updatePost
);

router.delete('/:id', deletePost);
router.put('/:id/photo', postPhotoUpload);

// Create a separate router for admin-only routes
const adminRouter = express.Router({ mergeParams: true });
adminRouter.use(authorize('admin'));

// Mount admin routes under /admin prefix
router.use('/admin', adminRouter);

// Add any admin-only post routes here
// Example: adminRouter.post('/some-admin-route', adminOnlyHandler);

module.exports = router;
