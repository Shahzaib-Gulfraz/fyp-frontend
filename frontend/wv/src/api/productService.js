import api from './config';
import { Platform } from 'react-native';

/**
 * Product Service - Unified for Mobile and Web
 */
export const productService = {
    /**
     * Get all products with filters
     */
    getProducts: async (filters = {}) => {
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
    },

    /**
     * Get products for a specific shop
     */
    getShopProducts: async (shopId) => {
        const response = await api.get(`/products?shopId=${shopId}`);
        return response.data;
    },

    /**
     * Get single product by ID
     */
    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Get all categories
     */
    /**
     * Get all categories
     */
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    /**
     * Create new category (Admin)
     */
    createCategory: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    /**
     * Update category (Admin)
     */
    updateCategory: async (id, categoryData) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    /**
     * Delete category (Admin)
     */
    deleteCategory: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },

    /**
     * Create a new product
     */
    createProduct: async (productData, images) => {
        console.log('F-DEBUG: createProduct called', { hasThumbnail: !!images.thumbnail });
        const formData = new FormData();

        // Helper to append image (Cross-platform)
        const appendImage = async (key, uri, name) => {
            try {
                if (Platform.OS === 'web') {
                    console.log(`F-DEBUG: Appending ${key} as blob on web`);
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    formData.append(key, blob, name);
                } else {
                    console.log(`F-DEBUG: Appending ${key} as object on mobile`);
                    formData.append(key, {
                        uri,
                        type: 'image/jpeg',
                        name,
                    });
                }
            } catch (err) {
                console.error(`F-DEBUG: Failed to append ${key}:`, err);
                throw new Error(`Failed to process image ${key}`);
            }
        };

        // Add basic fields
        Object.keys(productData).forEach(key => {
            const value = productData[key];
            if (value === null || value === undefined) {
                return; // Skip null/undefined values
            }
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'object') {
                // Stringify objects (like specifications Map)
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        // Add thumbnail if exists
        if (images.thumbnail) {
            await appendImage('thumbnail', images.thumbnail, 'thumbnail.jpg');
        }

        // Add additional images
        if (images.images && images.images.length > 0) {
            for (let i = 0; i < images.images.length; i++) {
                await appendImage('images', images.images[i], `image_${i}.jpg`);
            }
        }

        const config = {
            headers: {
                'Content-Type': Platform.OS === 'web' ? 'multipart/form-data' : 'multipart/form-data',
            },
            transformRequest: (data, headers) => {
                if (Platform.OS === 'web') {
                    // On web, let the browser set the Content-Type with boundary
                    delete headers['Content-Type'];
                }
                return data;
            },
        };

        const response = await api.post('/products', formData, config);
        return response.data;
    },

    /**
     * Update an existing product
     */
    updateProduct: async (productId, productData, images) => {
        const formData = new FormData();

        // Helper for update (Upload only if new)
        const appendUpdateImage = async (key, uri, name) => {
            if (!uri || uri.startsWith('http')) return;

            try {
                if (Platform.OS === 'web') {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    formData.append(key, blob, name);
                } else {
                    formData.append(key, {
                        uri,
                        type: 'image/jpeg',
                        name,
                    });
                }
            } catch (err) {
                console.error(`F-DEBUG: Failed to append ${key}:`, err);
                throw new Error(`Failed to process updated image ${key}`);
            }
        };

        // Add updated fields
        Object.keys(productData).forEach(key => {
            const value = productData[key];
            if (value === null || value === undefined) {
                return; // Skip null/undefined values
            }
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'object') {
                // Stringify objects (like specifications Map)
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        // Add thumbnail
        if (images?.thumbnail) {
            await appendUpdateImage('thumbnail', images.thumbnail, 'thumbnail.jpg');
        }

        // Add additional images
        if (images?.images && images.images.length > 0) {
            const newImages = images.images.filter(uri => !uri.startsWith('http'));
            for (let i = 0; i < newImages.length; i++) {
                await appendUpdateImage('images', newImages[i], `image_${i}.jpg`);
            }
        }

        const response = await api.put(`/products/${productId}`, formData);
        return response.data;
    },

    /**
     * Delete a product
     */
    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    }
};

export default productService;
