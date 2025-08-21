const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource - explicitly include slug and other required fields
  let query = Post.find(JSON.parse(queryStr))
    .select('title content excerpt author status featuredImage tags slug createdAt updatedAt')
    .populate('author', 'name');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Post.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const posts = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: posts.length,
    pagination,
    data: posts,
  });
});

// @desc    Get single post by ID or slug
// @route   GET /api/posts/:id
// @route   GET /api/posts/slug/:slug
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  console.log('getPost called with params:', req.params);
  let query;
  
  // Check if the parameter is a valid MongoDB ObjectId
  if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('Looking up post by ID:', req.params.id);
    query = Post.findById(req.params.id);
  } 
  // If it's a slug (from /slug/:slug route)
  else if (req.params.slug) {
    console.log('Looking up post by slug:', req.params.slug);
    query = Post.findOne({ slug: req.params.slug });
  }
  // If it's a slug but came through the /:id route
  else if (req.params.id) {
    console.log('Looking up post by ID as slug:', req.params.id);
    query = Post.findOne({ slug: req.params.id });
  } else {
    console.error('No post identifier provided');
    return next(new ErrorResponse('No post identifier provided', 400));
  }

  // Populate author and comments
  const post = await query
    .populate('author', 'name')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name',
      },
    });

  if (!post) {
    const identifier = req.params.slug || req.params.id;
    return next(
      new ErrorResponse(`Post not found with identifier: ${identifier}`, 404)
    );
  }

  // Increment view count
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.author = req.user.id;

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this post`,
        401
      )
    );
  }

  await post.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getPostsByUser = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ author: req.params.userId });
  
  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// @desc    Upload photo for post
// @route   PUT /api/posts/:id/photo
// @access  Private
exports.postPhotoUpload = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${post._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Post.findByIdAndUpdate(req.params.id, { featuredImage: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
