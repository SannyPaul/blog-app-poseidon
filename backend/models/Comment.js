const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please add some content'],
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a text index for search functionality
commentSchema.index({ content: 'text' });

// Add a virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  justOne: false,
});

// Cascade delete replies when a comment is deleted
commentSchema.pre('remove', async function (next) {
  await this.model('Comment').deleteMany({ parentComment: this._id });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
