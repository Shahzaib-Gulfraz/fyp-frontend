const SavedItem = require('../models/SavedItem');

/**
 * @desc    Get user's saved items
 * @route   GET /api/saved-items
 * @access  Private
 */
const getSavedItems = async (req, res) => {
    try {
        const savedItems = await SavedItem.find({ userId: req.user._id })
            .populate({
                path: 'productId',
                select: 'name price thumbnail category shopId',
                populate: {
                    path: 'shopId',
                    select: 'shopName'
                }
            })
            .populate('variantId')
            .sort('-createdAt');

        res.json({ savedItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Add item to saved
 * @route   POST /api/saved-items
 * @access  Private
 */
const addSavedItem = async (req, res) => {
    try {
        const { productId, variantId } = req.body;

        // Check if already saved
        const existing = await SavedItem.findOne({
            userId: req.user._id,
            productId,
            variantId: variantId || null
        });

        if (existing) {
            return res.status(400).json({ message: 'Item already saved' });
        }

        const savedItem = await SavedItem.create({
            userId: req.user._id,
            productId,
            variantId
        });

        await savedItem.populate('productId', 'name price thumbnail');

        res.status(201).json({
            message: 'Item saved successfully',
            savedItem
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Remove saved item
 * @route   DELETE /api/saved-items/:id
 * @access  Private
 */
const removeSavedItem = async (req, res) => {
    try {
        const savedItem = await SavedItem.findById(req.params.id);

        if (!savedItem) {
            return res.status(404).json({ message: 'Saved item not found' });
        }

        // Check ownership
        if (savedItem.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await SavedItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Item removed from saved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Check if product is saved
 * @route   GET /api/saved-items/check/:productId
 * @access  Private
 */
const checkSaved = async (req, res) => {
    try {
        const saved = await SavedItem.findOne({
            userId: req.user._id,
            productId: req.params.productId
        });

        res.json({ isSaved: !!saved });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getSavedItems,
    addSavedItem,
    removeSavedItem,
    checkSaved
};
