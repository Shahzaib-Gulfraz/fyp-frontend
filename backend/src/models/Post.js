const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tryOnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TryOn'
    },
    image: {
        type: String, // URL of the image
        required: [true, 'Post image is required']
    },
    caption: {
        type: String,
        trim: true,
        maxlength: [2000, 'Caption cannot exceed 2000 characters']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
    }
}, {
    timestamps: true
});

// Indexes for feed performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ visibility: 1 });

module.exports = mongoose.model('Post', postSchema);
