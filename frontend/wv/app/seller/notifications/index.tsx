import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/src/context/ThemeContext';
import { notificationService } from '@/src/api/notificationService';
import { useSocket } from '@/src/context/SocketContext';

export default function SellerNotifications() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const { socket, setUnreadNotifications } = useSocket();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: any) => {
            console.log('[Notifications] Real-time notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || []);
            // Update global badge count if supported by API returning count
            // Or assume marking read decrements it
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadNotifications(0); // Reset badge
        } catch (error) {
            console.log('Error marking all read:', error);
        }
    };

    const handleNotificationClick = async (item: any) => {
        if (!item.isRead) {
            try {
                await notificationService.markAsRead(item._id);
                setNotifications(prev => prev.map(n => n._id === item._id ? ({ ...n, isRead: true }) : n));
                setUnreadNotifications(prev => Math.max(0, prev - 1));
            } catch (e) {
                console.log('Error marking read:', e);
            }
        }

        // Navigate based on type
        if (item.type === 'order_status' && item.refId) {
            router.push(`/seller/orders/${item.refId}`);
        } else if (item.type === 'message') {
            router.push('/seller/messages');
        }
    };

    const styles = getStyles(colors, isDark);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: item.isRead ? colors.card : (isDark ? '#2a2a2a' : '#e6f7ff') } // Highlight unread
            ]}
            onPress={() => handleNotificationClick(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.isRead ? '#ccc' : colors.primary }]}>
                <Ionicons
                    name={item.type === 'order_status' ? 'cart' : item.type === 'message' ? 'chatbubble' : 'notifications'}
                    size={20}
                    color="#fff"
                />
            </View>
            <View style={styles.content}>
                <Text style={[styles.message, { color: colors.text, fontWeight: item.isRead ? 'normal' : 'bold' }]}>
                    {item.text}
                </Text>
                <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: isDark ? '#aaa' : '#666' }}>No notifications</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text
    },
    markReadBtn: { padding: 4 },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    content: { flex: 1 },
    message: { fontSize: 14, marginBottom: 4 },
    time: { fontSize: 12, color: '#999' },
});
