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
            .populate('shopId', 'shopName shopUsername logo city rating')
            .populate('category', 'name icon');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Increment view count
        try {
            await Product.findByIdAndUpdate(req.params.id, { 
                $inc: { 'stats.viewsCount': 1 } 
            });
        } catch (err) {
            console.log('Error updating view count:', err);
        }

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
        console.log('B-DEBUG: createProduct [START]');
        console.log('B-DEBUG: Content-Type:', req.headers['content-type']);
        console.log('B-DEBUG: Body keys:', Object.keys(req.body));
        console.log('B-DEBUG: Files keys:', req.files ? Object.keys(req.files) : 'no files');

        const {
            name, description, category, subcategory,
            price, compareAtPrice, currency,
            sku, stockQuantity, brand, material,
            careInstructions, colors, sizes, tags,
            specifications, tryon, isFeatured
        } = req.body;

        // Input Validation
        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Product name must be at least 3 characters long'
            });
        }

        if (!category) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Category is required'
            });
        }

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Price must be a positive number greater than 0'
            });
        }

        if (compareAtPrice && (isNaN(Number(compareAtPrice)) || Number(compareAtPrice) < 0)) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Original price must be a non-negative number'
            });
        }

        if (compareAtPrice && Number(compareAtPrice) > 0 && Number(compareAtPrice) < Number(price)) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Original price must be greater than or equal to the selling price'
            });
        }

        if (stockQuantity && (isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0)) {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Stock quantity must be a non-negative number'
            });
        }

        const productData = {
            shopId: req.shop._id,
            name, description, category, subcategory,
            price: Number(price),
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
            currency, sku,
            stockQuantity: Number(stockQuantity) || 0,
            brand, material, careInstructions,
            colors: typeof colors === 'string' ? JSON.parse(colors) : colors,
            sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
            specifications: typeof specifications === 'string' ? JSON.parse(specifications) : specifications,
            tryon: tryon === 'true' || tryon === true,
            isFeatured: isFeatured === 'true' || isFeatured === true
        };

        // Handle image uploads
        if (req.files) {
            console.log('B-DEBUG: Processing files...');
            // Upload thumbnail
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                console.log('B-DEBUG: Uploading thumbnail...');
                const b64 = Buffer.from(req.files.thumbnail[0].buffer).toString('base64');
                const dataURI = `data:${req.files.thumbnail[0].mimetype};base64,${b64}`;
                productData.thumbnail = await uploadImage(dataURI, 'products/thumbnails');
                console.log('B-DEBUG: Thumbnail uploaded:', !!productData.thumbnail);
            } else {
                console.log('B-DEBUG: Thumbnail missing from req.files');
                return res.status(400).json({
                    message: 'Thumbnail is required',
                    error: 'Please provide a thumbnail image'
                });
            }

            // Upload additional images
            if (req.files.images && req.files.images.length > 0) {
                console.log(`B-DEBUG: Uploading ${req.files.images.length} images...`);
                const imagePromises = req.files.images.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64');
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    return await uploadImage(dataURI, 'products');
                });
                productData.images = await Promise.all(imagePromises);
                console.log('B-DEBUG: Images uploaded:', productData.images.length);
            }
        } else {
            console.log('B-DEBUG: No files in request');
            return res.status(400).json({
                message: 'No images received',
                error: 'Thumbnail and optional images are required'
            });
        }

        console.log('B-DEBUG: Creating product in DB...');
        const product = await Product.create(productData);
        console.log('B-DEBUG: Product created with ID:', product._id);

        // Update shop product count
        const Shop = require('../models/Shop');
        await Shop.findByIdAndUpdate(req.shop._id, {
            $inc: { 'stats.totalProducts': 1 }
        });

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);

        // Handle specific mongoose errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                error: error.message,
                details: error.errors
            });
        }
        if (error.code === 11000) {
            console.error('Duplicate Key Details:', error.keyValue);
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: 'Duplicate Field Error',
                error: `A product with this ${field} already exists`
            });
        }

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
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

        const {
            name, description, category, subcategory,
            price, compareAtPrice, currency,
            sku, stockQuantity, brand, material,
            careInstructions, colors, sizes, tags,
            specifications, tryon,
            isActive, isFeatured
        } = req.body;

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (subcategory !== undefined) product.subcategory = subcategory;
        if (price !== undefined) product.price = Number(price);
        if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined;
        if (currency) product.currency = currency;
        if (sku !== undefined) product.sku = sku;
        if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
        if (brand !== undefined) product.brand = brand;
        if (material !== undefined) product.material = material;
        if (careInstructions !== undefined) product.careInstructions = careInstructions;
        if (tryon !== undefined) product.tryon = tryon === 'true' || tryon === true;
        if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;
        if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

        // Handle arrays
        if (colors) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
        if (sizes) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        if (tags) product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (specifications) product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

        // Handle image updates
        if (req.files) {
            // Update thumbnail
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                // Delete old thumbnail
                if (product.thumbnail?.publicId) {
                    await deleteImage(product.thumbnail.publicId);
                }
                const b64 = Buffer.from(req.files.thumbnail[0].buffer).toString('base64');
                const dataURI = `data:${req.files.thumbnail[0].mimetype};base64,${b64}`;
                product.thumbnail = await uploadImage(dataURI, 'products/thumbnails');
            }

            // Update additional images (this logic replaces all additional images if any new ones are sent)
            if (req.files.images && req.files.images.length > 0) {
                // Delete old images
                if (product.images && product.images.length > 0) {
                    const publicIds = product.images.map(img => img.publicId).filter(Boolean);
                    if (publicIds.length > 0) {
                        await deleteMultipleImages(publicIds);
                    }
                }
                const imagePromises = req.files.images.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64');
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    return await uploadImage(dataURI, 'products');
                });
                product.images = await Promise.all(imagePromises);
            }
        }

        await product.save();

        res.json({
            status: 'success',
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
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

/**
 * @desc    Upload product image (for Try-On or general use)
 * @route   POST /api/products/upload-image
 * @access  Private
 */
const uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to a specific 'try-on' folder or general 'products'
        const result = await uploadImage(dataURI, 'products/try-on-uploads');

        res.json({
            success: true,
            imageUrl: result.url,
            publicId: result.publicId
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
};
