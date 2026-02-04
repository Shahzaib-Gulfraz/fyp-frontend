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
    const [shopId, setShopId] = useState<string | null>(null);

    // Monitor shop authentication changes
    useEffect(() => {
        const checkShopAuth = async () => {
            try {
                const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
                const shopData = await AsyncStorage.getItem('shop');
                if (shopData) {
                    const shop = JSON.parse(shopData);
                    const id = shop._id || shop.id;
                    if (id !== shopId) {
                        console.log('[Socket] Shop authentication detected:', id);
                        setShopId(id);
                    }
                } else if (shopId) {
                    console.log('[Socket] Shop logged out');
                    setShopId(null);
                }
            } catch (e) {
                console.error('[Socket] Failed to check shop auth:', e);
            }
        };

        // Check immediately on mount
        checkShopAuth();

        // Check periodically for shop auth changes
        const interval = setInterval(checkShopAuth, 2000);
        return () => clearInterval(interval);
    }, [shopId]);

    // Initialize socket connection
    useEffect(() => {
        const initSocket = async () => {
            let id = user?.id || user?._id;

            // If no user from context, use shop ID
            if (!id && shopId) {
                id = shopId;
                console.log('[Socket] Using shop ID for connection:', id);
            }

            if (id) {
                // Only create new socket if ID changed or socket doesn't exist
                if (currentId === id && socket) {
                    console.log('[Socket] Already connected with same ID');
                    return;
                }

                // Disconnect old socket if ID changed
                if (socket && currentId !== id) {
                    console.log('[Socket] ID changed, disconnecting old socket');
                    socket.disconnect();
                }

                setCurrentId(id);

                const newSocket = io(SOCKET_URL, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: 5,
                });

                newSocket.on('connect', () => {
                    console.log('[Socket] Connected. ID:', newSocket.id);
                    setIsConnected(true);
                    console.log('[Socket] Joining room:', id);
                    newSocket.emit('join', id);
                });

                newSocket.on('disconnect', () => {
                    console.log('[Socket] Disconnected');
                    setIsConnected(false);
                });

                newSocket.on('connect_error', (error) => {
                    console.error('[Socket] Connection error:', error.message);
                });

                setSocket(newSocket);
            } else {
                if (socket) {
                    console.log('[Socket] No ID found, disconnecting');
                    socket.disconnect();
                    setSocket(null);
                    setIsConnected(false);
                    setCurrentId(null);
                }
            }
        };

        initSocket();

        return () => {
            // Cleanup on unmount
            // In development with hot reload, we might skip this
            // In production, uncomment to disconnect
            // if (socket) {
            //     socket.disconnect();
            // }
        };
    }, [user, user?.id, shopId]); // Re-run if user or shop changes

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

            // Listen for new orders (triggers notification count update)
            const handleNewOrder = (data: any) => {
                console.log('New order received:', data);
                setUnreadNotifications(prev => prev + 1);
            };

            socket.on('notification:new', handleNewNotification);
            socket.on('message:new', handleNewMessage);
            socket.on('new_message', handleNewMessage); // Handle both naming conventions
            socket.on('new_order', handleNewOrder);

            return () => {
                socket.off('notification:new', handleNewNotification);
                socket.off('message:new', handleNewMessage);
                socket.off('new_message', handleNewMessage);
                socket.off('new_order', handleNewOrder);
            };
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadNotifications, setUnreadNotifications, unreadMessages, setUnreadMessages }}>
            {children}
        </SocketContext.Provider>
    );
};
