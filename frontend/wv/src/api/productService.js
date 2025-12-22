import api from './config';

/**
 * Product Service
 */
const productService = {
    /**
     * Get all products with filters
     */
    getProducts: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.shopId) params.append('shopId', filters.shopId);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await api.get(`/products?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single product by ID
     */
    getProduct: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create new product (Shop Owner only)
     */
    createProduct: async (productData, images) => {
        try {
            const formData = new FormData();

            // Add product data
            Object.keys(productData).forEach(key => {
                if (productData[key] !== null && productData[key] !== undefined) {
                    formData.append(key, productData[key]);
                }
            });

            // Add thumbnail
            if (images.thumbnail) {
                formData.append('thumbnail', {
                    uri: images.thumbnail,
                    type: 'image/jpeg',
                    name: 'thumbnail.jpg',
                });
            }

            // Add additional images
            if (images.images && images.images.length > 0) {
                images.images.forEach((imageUri, index) => {
                    formData.append('images', {
                        uri: imageUri,
                        type: 'image/jpeg',
                        name: `image_${index}.jpg`,
                    });
                });
            }

            const response = await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update product
     */
    updateProduct: async (productId, productData) => {
        try {
            const response = await api.put(`/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete product
     */
    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default productService;
