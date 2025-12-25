import api from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    getShopProducts: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}/products`);
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
                // For React Native, we use the {uri, name, type} object
                // If this is Web, we'd need a different approach, but sticking to RN for now
                formData.append('logo', {
                    uri: images.logo,
                    type: 'image/jpeg',
                    name: 'logo.jpg',
                });
            }

            // Add banner
            if (images.banner) {
                console.log('Adding banner to formData:', images.banner);
                formData.append('banner', {
                    uri: images.banner,
                    type: 'image/jpeg',
                    name: 'banner.jpg',
                });
            }

            console.log('Sending register request to /shops/register...');
            const response = await api.post('/shops/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
    updateShop: async (shopId, shopData) => {
        try {
            const response = await api.put(`/shops/${shopId}`, shopData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default shopService;
