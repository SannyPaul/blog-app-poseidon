const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// @route   GET /api/test/post
// @desc    Get first post for testing
// @access  Public
router.get('/post', async (req, res) => {
  try {
    const post = await Post.findOne().select('id slug title');
    console.log('Test post:', post);
    res.json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('Test error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
