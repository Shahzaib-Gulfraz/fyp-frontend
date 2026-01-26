import api from './config';

export const chatService = {
    getConversations: () => {
        return api.get('/chat/conversations');
    },

    getMessages: (conversationId: string, page = 1) => {
        return api.get(`/chat/messages/${conversationId}?page=${page}`);
    },

    sendMessage: (recipientId: string, text: string) => {
        return api.post('/chat/message', { recipientId, text });
    },

    startChat: (recipientId: string) => {
        return api.post('/chat/start', { recipientId });
    }
};
