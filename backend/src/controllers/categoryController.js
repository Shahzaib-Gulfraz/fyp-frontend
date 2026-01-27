const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('name');
        res.json({
            status: 'success',
            results: categories.length,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res) => {
    try {
        console.log('B-DEBUG: Creating category:', req.body.name);
        const { name, icon, description, type, attributes, isTryOnEnabled } = req.body;

        const category = await Category.create({
            name,
            icon,
            description,
            type,
            attributes,
            isTryOnEnabled
        });

        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate Category',
                error: 'Category with this name already exists'
            });
        }
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res) => {
    try {
        const { name, icon, description, type, attributes, isActive, isTryOnEnabled } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        category.name = name || category.name;
        category.icon = icon || category.icon;
        category.description = description || category.description;
        category.type = type || category.type;
        category.attributes = attributes || category.attributes;
        if (isActive !== undefined) category.isActive = isActive;
        if (isTryOnEnabled !== undefined) category.isTryOnEnabled = isTryOnEnabled;

        await category.save();

        res.json({
            status: 'success',
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Soft delete
        category.isActive = false;
        await category.save();

        res.json({
            status: 'success',
            message: 'Category deleted (archived) successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
