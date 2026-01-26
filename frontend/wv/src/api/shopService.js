import api from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Shop Service
 */
const shopService = {
    /**
     * Get all shops
     */
    getShops: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.city) params.append('city', filters.city);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await api.get(`/shops?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single shop by ID
     */
    getShop: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get shop products
     */
    getShopProducts: async (shopId, filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.sort) params.append('sort', filters.sort);

            const response = await api.get(`/shops/${shopId}/products?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Register new shop
     */
    registerShop: async (shopData, images) => {
        try {
            console.log('shopService.registerShop starting...', { email: shopData.email });
            const formData = new FormData();

            // Add shop data
            Object.keys(shopData).forEach(key => {
                if (shopData[key] !== null && shopData[key] !== undefined) {
                    formData.append(key, shopData[key]);
                }
            });

            // Add logo
            if (images.logo) {
                console.log('Adding logo to formData:', images.logo);

                const isWebOrBlob = Platform.OS === 'web' || (typeof images.logo === 'string' && images.logo.startsWith('blob:'));

                if (isWebOrBlob) {
                    // Web or Chrome Debugger: Fetch blob from blob: URI
                    const response = await fetch(images.logo);
                    const blob = await response.blob();
                    formData.append('logo', blob, 'logo.jpg');
                } else {
                    // Native: Use object with uri, type, name
                    formData.append('logo', {
                        uri: images.logo,
                        type: 'image/jpeg',
                        name: 'logo.jpg',
                    });
                }
            }

            // Add banner
            if (images.banner) {
                console.log('Adding banner to formData:', images.banner);

                const isWebOrBlob = Platform.OS === 'web' || (typeof images.banner === 'string' && images.banner.startsWith('blob:'));

                if (isWebOrBlob) {
                    const response = await fetch(images.banner);
                    const blob = await response.blob();
                    formData.append('banner', blob, 'banner.jpg');
                } else {
                    formData.append('banner', {
                        uri: images.banner,
                        type: 'image/jpeg',
                        name: 'banner.jpg',
                    });
                }
            }

            console.log('Sending register request to /shops/register...');
            const response = await api.post('/shops/register', formData);

            console.log('Register request successful:', !!response.data.token);

            // Save token and shop data
            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('shop', JSON.stringify(response.data.shop));
                await AsyncStorage.setItem('userType', 'shop');
                console.log('Shop auth data saved to AsyncStorage');
            }

            return response.data;
        } catch (error) {
            console.error('shopService.registerShop error:', error);
            throw error;
        }
    },

    /**
     * Login shop
     */
    loginShop: async (email, password) => {
        try {
            const response = await api.post('/shops/login', { email, password });

            // Save token and shop data
            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('shop', JSON.stringify(response.data.shop));
                await AsyncStorage.setItem('userType', 'shop');
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get my shop profile (for logged in shops)
     */
    getMyShop: async () => {
        try {
            const response = await api.get('/shops/my/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update shop
     */
    updateShop: async (shopId, shopData, images = {}) => {
        try {
            const formData = new FormData();

            // Add text fields
            Object.keys(shopData).forEach(key => {
                if (key === 'logo' || key === 'banner') return; // Skip images here
                if (shopData[key] !== null && shopData[key] !== undefined) {
                    if (typeof shopData[key] === 'object') {
                        formData.append(key, JSON.stringify(shopData[key]));
                    } else {
                        formData.append(key, shopData[key]);
                    }
                }
            });

            // Add logo
            if (images.logo && !images.logo.startsWith('http')) {
                console.log('F-DEBUG: Uploading new logo:', images.logo);

                const isWebOrBlob = Platform.OS === 'web' || (typeof images.logo === 'string' && images.logo.startsWith('blob:'));

                if (isWebOrBlob) {
                    const response = await fetch(images.logo);
                    const blob = await response.blob();
                    formData.append('logo', blob, 'logo.jpg');
                } else {
                    formData.append('logo', {
                        uri: images.logo,
                        type: 'image/jpeg',
                        name: 'logo.jpg',
                    });
                }
            }

            // Add banner
            if (images.banner && !images.banner.startsWith('http')) {
                console.log('F-DEBUG: Uploading new banner:', images.banner);

                const isWebOrBlob = Platform.OS === 'web' || (typeof images.banner === 'string' && images.banner.startsWith('blob:'));

                if (isWebOrBlob) {
                    const response = await fetch(images.banner);
                    const blob = await response.blob();
                    formData.append('banner', blob, 'banner.jpg');
                } else {
                    formData.append('banner', {
                        uri: images.banner,
                        type: 'image/jpeg',
                        name: 'banner.jpg',
                    });
                }
            }

            const response = await api.put(`/shops/${shopId}`, formData);

            // Update local storage if shop data returned
            if (response.data.shop) {
                await AsyncStorage.setItem('shop', JSON.stringify(response.data.shop));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Follow Shop
     */
    followShop: async (shopId) => {
        try {
            const response = await api.post(`/shops/${shopId}/follow`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Unfollow Shop
     */
    unfollowShop: async (shopId) => {
        try {
            const response = await api.delete(`/shops/${shopId}/follow`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Check Follow Status
     */
    checkFollowStatus: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}/is-following`);
            return response.data;
        } catch (error) {
            // Likely 401 if not logged in
            return { isFollowing: false };
        }
    },

    /**
     * Get Shop Reviews
     */
    getShopReviews: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}/reviews`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get Shop Dashboard Stats
     */
    getShopStats: async () => {
        try {
            const response = await api.get('/shops/my/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/shops/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (data) => {
        try {
            const response = await api.post('/shops/reset-password', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default shopService;
