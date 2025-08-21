const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Please add a reaction type'],
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reactions from same user on same post
reactionSchema.index({ post: 1, user: 1 }, { unique: true });

// Static method to get reaction counts for a post
reactionSchema.statics.getReactionCounts = async function (postId) {
  try {
    console.log('Getting reaction counts for post:', postId);
    
    if (!postId) {
      console.error('No postId provided to getReactionCounts');
      return {};
    }
    
    // Ensure postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.error('Invalid postId:', postId);
      return {};
    }
    
    const result = await this.aggregate([
      {
        $match: { 
          post: new mongoose.Types.ObjectId(postId) 
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    
    console.log('Aggregation result:', JSON.stringify(result, null, 2));
    
    // Convert array to object with reaction types as keys
    const counts = result.reduce((acc, curr) => {
      if (curr && curr._id) {
        acc[curr._id] = curr.count;
      }
      return acc;
    }, {});
    
    console.log('Returning reaction counts:', counts);
    return counts;
  } catch (error) {
    console.error('Error in getReactionCounts:', error);
    return {};
  }
};

// Call getReactionCounts after save
reactionSchema.post('save', async function () {
  const Post = mongoose.model('Post');
  const reactionCounts = await this.constructor.getReactionCounts(this.post);
  await Post.findByIdAndUpdate(this.post, { reactionCounts });
});

// Call getReactionCounts after remove
reactionSchema.post('remove', async function () {
  const Post = mongoose.model('Post');
  const reactionCounts = await this.constructor.getReactionCounts(this.post);
  await Post.findByIdAndUpdate(this.post, { reactionCounts });
});

module.exports = mongoose.model('Reaction', reactionSchema);
