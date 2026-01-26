import api from './config';

export const notificationService = {
    /**
     * Get paginated notifications
     */
    getNotifications: async (page = 1, limit = 20) => {
        const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (notificationId: string) => {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (notificationId: string) => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    }
};
