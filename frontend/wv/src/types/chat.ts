import { User } from '../context/UserContext';

export interface Message {
    _id: string;
    conversationId: string;
    sender: User | string;
    text: string;
    createdAt: string;
    isRead: boolean;
}

export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage: {
        text: string;
        sender: User | string;
        createdAt: string;
        isRead: boolean;
    };
    updatedAt: string;
    createdAt: string;
}
