import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';
import { API_BASE_URL as API_URL } from '../api/config'; // Ensure this points to backend base URL

const SOCKET_URL = API_URL.replace('/api', ''); // Base URL for socket

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadNotifications: number;
    setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
    unreadMessages: number;
    setUnreadMessages: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    unreadNotifications: 0,
    setUnreadNotifications: () => { },
    unreadMessages: 0,
    setUnreadMessages: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Initialize socket connection
    useEffect(() => {
        const initSocket = async () => {
            let id = user?.id || user?._id;

            // If no user from context, check if we are a shop logged in
            if (!id) {
                try {
                    const shopData = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('shop'));
                    if (shopData) {
                        const shop = JSON.parse(shopData);
                        id = shop._id || shop.id;
                    }
                } catch (e) {
                    console.error('Socket: Failed to load shop data', e);
                }
            }

            if (id) {
                setCurrentId(id);
                // Avoid creating multiple sockets
                if (socket) return;

                const newSocket = io(SOCKET_URL, {
                    transports: ['websocket'],
                    reconnection: true,
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected:', newSocket.id);
                    setIsConnected(true);
                    console.log('[Socket] Joining room:', id);
                    newSocket.emit('join', id);
                });

                newSocket.on('disconnect', () => {
                    console.log('Socket disconnected');
                    setIsConnected(false);
                });

                setSocket(newSocket);
            } else {
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                    setIsConnected(false);
                }
            }
        };

        initSocket();

        return () => {
            if (socket) {
                // We should technically disconnect here, but for hot reload stability we might check
                // In production, disconnect.
                // socket.disconnect(); 
            }
        };
    }, [user, user?.id]); // Re-run if user changes

    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (socket) {
            // Listen for new notifications
            const handleNewNotification = (data: any) => {
                console.log('New notification received:', data);
                setUnreadNotifications(prev => prev + 1);
            };

            // Listen for new messages
            const handleNewMessage = (data: any) => {
                console.log('New message received:', data);
                setUnreadMessages(prev => prev + 1);
            };

            socket.on('notification:new', handleNewNotification);
            socket.on('message:new', handleNewMessage);
            socket.on('new_message', handleNewMessage); // Handle both naming conventions

            return () => {
                socket.off('notification:new', handleNewNotification);
                socket.off('message:new', handleNewMessage);
                socket.off('new_message', handleNewMessage);
            };
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadNotifications, setUnreadNotifications, unreadMessages, setUnreadMessages }}>
            {children}
        </SocketContext.Provider>
    );
};
