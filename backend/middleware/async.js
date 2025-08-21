// This is a wrapper function that allows us to use async/await with Express routes
// It catches any errors that occur in async functions and passes them to Express's error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
