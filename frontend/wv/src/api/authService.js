import api from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Service
 */
const authService = {
    /**
     * Register new user
     */
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);

            // Save token and user data
            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login user
     */
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            // Save token and user data
            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            console.log('authservice logout');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        try {
            const response = await api.get('/auth/me');

            // Update stored user data
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);

            // Update stored user data
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload avatar
     */
    uploadAvatar: async (imageUri) => {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'avatar.jpg',
            });

            const response = await api.post('/auth/avatar', formData, {
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
     * Get stored user data
     */
    getStoredUser: async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return !!token;
        } catch (error) {
            return false;
        }
    },
};

export default authService;
