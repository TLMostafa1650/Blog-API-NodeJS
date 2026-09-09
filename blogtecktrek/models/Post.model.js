const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Helpful indexes for search & filtering
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);
