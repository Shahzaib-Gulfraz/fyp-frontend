import api from './config';

/**
 * Order Service
 */
const orderService = {
    /**
     * Create new order
     */
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get user's orders
     */
    getUserOrders: async () => {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get shop orders (for shop owners)
     */
    getShopOrders: async (shopId) => {
        try {
            const response = await api.get(`/orders/shop/${shopId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single order details
     */
    getOrder: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update order status (shop owner only)
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default orderService;
