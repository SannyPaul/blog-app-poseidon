const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log('Protect middleware called for path:', req.path);
  console.log('Authorization header:', req.headers.authorization);

  // Set token from Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  //   console.log('Token found in cookie');
  // }

  // Make sure token exists
  if (!token) {
    console.log('No token found');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return next(new ErrorResponse('User not found', 404));
    }

    console.log('User found:', user.email);
    console.log('User role:', user.role);
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
