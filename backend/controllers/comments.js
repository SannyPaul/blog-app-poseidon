const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  if (!req.params.postId) {
    return next(new ErrorResponse('Please provide a post ID', 400));
  }

  // Check if post exists
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.postId}`, 404)
    );
  }

  // Get top-level comments (not replies)
  const comments = await Comment.find({
    post: req.params.postId,
    parentComment: { $exists: false },
  })
    .populate('author', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  });
});

// @desc    Get comment replies
// @route   GET /api/comments/:commentId/replies
// @access  Public
exports.getCommentReplies = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.commentId}`, 404)
    );
  }

  const replies = await Comment.find({
    parentComment: req.params.commentId,
  })
    .populate('author', 'name')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: replies.length,
    data: replies,
  });
});

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  req.body.post = req.params.postId;

  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.postId}`, 404)
    );
  }

  const comment = await Comment.create(req.body);

  // Populate author info for response
  await comment.populate('author', 'name');

  res.status(201).json({
    success: true,
    data: comment,
  });
});

// @desc    Reply to comment
// @route   POST /api/comments/:commentId/replies
// @access  Private
exports.addReply = asyncHandler(async (req, res, next) => {
  const parentComment = await Comment.findById(req.params.commentId);

  if (!parentComment) {
    return next(
      new ErrorResponse(
        `Parent comment not found with id of ${req.params.commentId}`,
        404
      )
    );
  }

  req.body.author = req.user.id;
  req.body.post = parentComment.post;
  req.body.parentComment = parentComment._id;

  const reply = await Comment.create(req.body);
  await reply.populate('author', 'name');

  res.status(201).json({
    success: true,
    data: reply,
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is comment owner or admin
  if (
    comment.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this comment`,
        401
      )
    );
  }

  // Only update the content and set isEdited to true
  comment.content = req.body.content || comment.content;
  comment.isEdited = true;

  comment = await comment.save();
  await comment.populate('author', 'name');

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is comment owner or admin
  if (
    comment.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this comment`,
        401
      )
    );
  }

  // If it's a top-level comment, delete all its replies first
  if (!comment.parentComment) {
    await Comment.deleteMany({ parentComment: comment._id });
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
