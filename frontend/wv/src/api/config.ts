import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this with your backend URL
import { Platform } from 'react-native';

// API Base URL - Update this with your backend URL
const getBaseUrl = () => {
    // Allow overriding via env (set EXPO_PUBLIC_API_URL in app config)
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    if (__DEV__) {
        if (Platform.OS === 'web') {
            return 'http://localhost:3000/api';
        }
        // LAN IP for device testing
        return 'http://192.168.100.44:3000/api';
    }
    return 'https://your-production-api.com/api';
};

const API_BASE_URL = getBaseUrl();

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 120 seconds for long-running operations like Try-On generation
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        if (__DEV__) {
            console.log(`[API] REQUEST: ${config.method?.toUpperCase()} ${config.url}`, config.headers);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`[API] SUCCESS: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
    },
    async (error) => {
        if (__DEV__) {
            const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
            console.log(`[API] ERROR LOG: ${error.config?.method?.toUpperCase()} ${fullUrl}`, error.response?.status);
            console.log('Error Details:', error.message);
        }
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            // Handle 401 Unauthorized - Token expired or invalid
            if (status === 401) {
                console.warn('[API] 401 Unauthorized. Token might be invalid.');
                // await AsyncStorage.removeItem('authToken');
                // await AsyncStorage.removeItem('user');
                // You can navigate to login screen here if needed
            }

            // Return error message and all data from server
            return Promise.reject({
                ...data, // Include any extra fields like 'error' or 'details'
                message: data.message || 'An error occurred',
                status,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An error occurred',
                status: 0,
            });
        }
    }
);

export default api;
export { API_BASE_URL };
