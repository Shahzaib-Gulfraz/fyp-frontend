import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this with your backend URL
const API_BASE_URL = __DEV__
    ? 'http://192.168.100.44:3000/api'  // Change to your computer's IP address
    : 'https://your-production-api.com/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            // Handle 401 Unauthorized - Token expired or invalid
            if (status === 401) {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
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
