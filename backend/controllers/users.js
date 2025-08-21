const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate({
      path: 'posts',
      select: 'title excerpt createdAt',
      options: { sort: { createdAt: -1 }, limit: 5 },
    });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete all user's posts and comments
  await Promise.all([
    Post.deleteMany({ author: user._id }),
    Comment.deleteMany({ author: user._id }),
    Reaction.deleteMany({ user: user._id }),
  ]);

  await user.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Ban/Unban user
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
exports.banUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent banning admin users
  if (user.role === 'admin') {
    return next(new ErrorResponse('Cannot ban admin users', 403));
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
        },
        bannedUsers: {
          $sum: { $cond: ['$isBanned', 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        adminUsers: 1,
        bannedUsers: 1,
        activeUsers: { $subtract: ['$totalUsers', '$bannedUsers'] },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || { totalUsers: 0, adminUsers: 0, bannedUsers: 0, activeUsers: 0 },
  });
});
