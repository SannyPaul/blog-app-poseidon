const mongoose = require('mongoose');
const ErrorResponse = require('./errorResponse');

const validateMongoDbId = (id, resource = 'Resource') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(`${resource} not found with id of ${id}`, 404);
  }
};

module.exports = validateMongoDbId;
