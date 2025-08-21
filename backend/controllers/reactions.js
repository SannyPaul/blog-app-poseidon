const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Add or update reaction to a post
// @route   PUT /api/posts/:postId/reactions
// @access  Private
exports.addOrUpdateReaction = asyncHandler(async (req, res, next) => {
  console.log('addOrUpdateReaction called with body:', req.body);
  console.log('postId from params:', req.params.postId);
  console.log('postId from req.postId:', req.postId);
  console.log('user:', req.user ? req.user.id : 'No user');
  
  const { type } = req.body;
  
  if (!type) {
    console.log('No reaction type provided');
    return next(new ErrorResponse('Please provide a reaction type', 400));
  }

  // Check if post exists
  const postId = req.postId || req.params.postId;
  console.log('Using postId:', postId);
  
  const post = await Post.findById(postId);
  if (!post) {
    console.log('Post not found:', postId);
    return next(
      new ErrorResponse(`Post not found with id of ${postId}`, 404)
    );
  }

  // Check if user already reacted to this post
  let reaction = await Reaction.findOne({
    post: postId,
    user: req.user.id,
  });

  if (reaction) {
    // If same reaction type, remove it (toggle)
    if (reaction.type === type) {
      await reaction.remove();
      
      // Get updated reaction counts
      const reactionCounts = await Reaction.getReactionCounts(postId);
      
      return res.status(200).json({
        success: true,
        data: {
          reaction: null,
          reactionCounts,
        },
      });
    }
    
    // Update existing reaction
    reaction.type = type;
    await reaction.save();
    console.log('Updated existing reaction:', reaction);
  } else {
    // Create new reaction
    reaction = await Reaction.create({
      type,
      post: postId,
      user: req.user.id,
    });
    console.log('Created new reaction:', reaction);
  }

  try {
    // Get updated reaction counts
    const reactionCounts = await Reaction.getReactionCounts(postId);
    console.log('Updated reaction counts:', reactionCounts);
    
    // Format the response
    const response = {
      success: true,
      data: {
        reaction: reaction || null,
        reactionCounts: reactionCounts || {},
      },
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in addOrUpdateReaction:', error);
    return next(new ErrorResponse('Error updating reaction', 500));
  }
});

// @desc    Get reactions for a post
// @route   GET /api/posts/:postId/reactions
// @access  Public
exports.getReactions = asyncHandler(async (req, res, next) => {
  // Check if post exists
  const postId = req.postId || req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${postId}`, 404)
    );
  }

  // Get all reactions for this post
  const reactions = await Reaction.find({ post: postId })
    .populate('user', 'name')
    .sort('-createdAt');

  // Get reaction counts
  const reactionCounts = await Reaction.getReactionCounts(postId);
  
  // Check if current user has reacted
  let userReaction = null;
  if (req.user) {
    userReaction = await Reaction.findOne({
      post: postId,
      user: req.user.id,
    });
  }

  res.status(200).json({
    success: true,
    count: reactions.length,
    data: {
      reactions,
      reactionCounts,
      userReaction: userReaction ? userReaction.type : null,
    },
  });
});

// @desc    Remove reaction from a post
// @route   DELETE /api/posts/:postId/reactions
// @access  Private
exports.removeReaction = asyncHandler(async (req, res, next) => {
  // Check if post exists
  const postId = req.postId || req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${postId}`, 404)
    );
  }

  // Find and remove the reaction
  const reaction = await Reaction.findOneAndRemove({
    post: postId,
    user: req.user.id,
  });

  if (!reaction) {
    return next(
      new ErrorResponse('No reaction found for this user and post', 404)
    );
  }

  // Get updated reaction counts
  const reactionCounts = await Reaction.getReactionCounts(postId);
  
  res.status(200).json({
    success: true,
    data: {
      reaction: null,
      reactionCounts,
    },
  });
});
