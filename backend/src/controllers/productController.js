const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { uploadImage, uploadMultipleImages, deleteImage, deleteMultipleImages } = require('../config/cloudinary');

/**
 * @desc    Get all products (with filters)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            shopId,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (category) query.category = category;
        if (shopId) query.shopId = shopId;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const products = await Product.find(query)
            .populate('shopId', 'shopName shopUsername logo')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('shopId', 'shopName shopUsername logo city rating');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Increment view count
        product.stats.viewsCount += 1;
        await product.save();

        // Get variants
        const variants = await ProductVariant.find({ productId: product._id, isActive: true });

        res.json({ product, variants });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (Shop Owner)
 */
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        productData.shopId = req.shop._id;

        // Handle image uploads
        if (req.files) {
            // Upload thumbnail
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const b64 = Buffer.from(req.files.thumbnail[0].buffer).toString('base64');
                const dataURI = `data:${req.files.thumbnail[0].mimetype};base64,${b64}`;
                productData.thumbnail = await uploadImage(dataURI, 'products/thumbnails');
            }

            // Upload additional images
            if (req.files.images && req.files.images.length > 0) {
                const imagePromises = req.files.images.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64');
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    return await uploadImage(dataURI, 'products');
                });
                productData.images = await Promise.all(imagePromises);
            }
        }

        const product = await Product.create(productData);

        // Update shop product count
        const Shop = require('../models/Shop');
        await Shop.findByIdAndUpdate(req.shop._id, {
            $inc: { 'stats.totalProducts': 1 }
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Shop Owner)
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.shopId.toString() !== req.shop._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update fields
        Object.assign(product, req.body);
        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Shop Owner)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.shopId.toString() !== req.shop._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete images from Cloudinary
        if (product.thumbnail?.publicId) {
            await deleteImage(product.thumbnail.publicId);
        }
        if (product.images && product.images.length > 0) {
            const publicIds = product.images.map(img => img.publicId).filter(Boolean);
            if (publicIds.length > 0) {
                await deleteMultipleImages(publicIds);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        // Update shop product count
        const Shop = require('../models/Shop');
        await Shop.findByIdAndUpdate(product.shopId, {
            $inc: { 'stats.totalProducts': -1 }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};
