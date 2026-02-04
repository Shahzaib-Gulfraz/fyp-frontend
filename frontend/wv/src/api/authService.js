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
                await AsyncStorage.setItem('userType', 'user');
            }

            return response.data;
        } catch (_error) {
            throw _error;
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
                await AsyncStorage.setItem('userType', 'user');
            }

            return response.data;
        } catch (_error) {
            throw _error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (data) => {
        try {
            const response = await api.post('/auth/reset-password', data);
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
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('shop');
        } catch (_error) {
            console.error('Logout error:', _error);
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        try {
            console.log('[AuthService] Fetching profile...');
            const response = await api.get('/auth/me');
            console.log('[AuthService] Profile fetched successfully:', response.data);

            // Update stored user data
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

            return response.data;
        } catch (_error) {
            console.error('[AuthService] Error fetching profile:', _error);
            if (_error.response) {
                console.error('[AuthService] Response status:', _error.response.status);
                console.error('[AuthService] Response data:', _error.response.data);
            }
            throw _error;
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData) => {
        try {
            console.log('[AuthService] Updating profile with data:', profileData);
            const response = await api.put('/auth/profile', profileData);
            console.log('[AuthService] Profile update response:', response.data);

            // Update stored user data
            if (response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('[AuthService] User data saved to AsyncStorage');
            }

            return response.data;
        } catch (_error) {
            console.error('[AuthService] Profile update error:', _error);
            throw _error;
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
        } catch (_error) {
            throw _error;
        }
    },

    /**
     * Upload avatar
     */
    uploadAvatar: async (imageUri) => {
        try {
            console.log('[AuthService] Uploading avatar from URI:', imageUri);
            
            const formData = new FormData();
            
            // Check if it's a blob URL (web) or file URI (native)
            if (imageUri.startsWith('blob:')) {
                // Web: Fetch the blob and convert to File
                console.log('[AuthService] Detected blob URL, fetching blob data...');
                const response = await fetch(imageUri);
                const blob = await response.blob();
                
                // Create a proper File object for web
                const filename = 'avatar-' + Date.now() + '.jpg';
                const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
                
                console.log('[AuthService] Created file from blob:', filename, 'Type:', file.type, 'Size:', file.size);
                formData.append('image', file);
            } else {
                // React Native: Use the original format
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                formData.append('image', {
                    uri: imageUri,
                    type: type,
                    name: filename || 'avatar.jpg',
                });
            }

            console.log('[AuthService] FormData prepared, sending request...');
            
            const response = await api.post('/auth/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('[AuthService] Avatar upload response:', response.data);
            return response.data;
        } catch (_error) {
            console.error('[AuthService] Avatar upload error:', _error);
            throw _error;
        }
    },

    /**
     * Get stored user data
     */
    getStoredUser: async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            return userJson ? JSON.parse(userJson) : null;
        } catch (_error) {
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
        } catch (_error) {
            return false;
        }
    },
};

export default authService;
