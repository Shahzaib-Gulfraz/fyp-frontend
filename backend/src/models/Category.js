const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        trim: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'multiselect', 'boolean'],
        default: 'text'
    },
    options: [String], // Only used if type is 'select' or 'multiselect'
    required: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    icon: {
        type: String,
        default: '📦'
    },
    description: String,

    type: {
        type: String,
        enum: ['clothing', 'footwear', 'accessory', 'other'],
        default: 'clothing',
        required: true
    },

    // Dynamic attributes for this category
    attributes: [attributeSchema],

    isActive: {
        type: Boolean,
        default: true
    },
    isTryOnEnabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create slug from name
categorySchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('Category', categorySchema);
