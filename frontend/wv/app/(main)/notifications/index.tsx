import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocket } from '@/src/context/SocketContext';
import { notificationService } from '@/src/api/notificationService';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { socket, unreadNotifications, setUnreadNotifications } = useSocket();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (pageNum = 1, shouldRefresh = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            const response = await notificationService.getNotifications(pageNum);

            const newNotifications = response.data.notifications || [];
            if (shouldRefresh) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }

            setHasMore(newNotifications.length >= 20);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            const handleNewNotification = (data: any) => {
                console.log('[Notifications Screen] New notification received:', data);
                
                // Add new notification to the top of the list
                if (data.notification) {
                    setNotifications(prev => [data.notification, ...prev]);
                }
                
                // Update unread count
                if (data.unreadCount !== undefined) {
                    setUnreadNotifications(data.unreadCount);
                }
            };

            socket.on('notification:new', handleNewNotification);

            return () => {
                socket.off('notification:new', handleNewNotification);
            };
        }
    }, [socket, setUnreadNotifications]);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchNotifications(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage);
        }
    };

    const handlePress = async (notification: any) => {
        // Mark as read if unread
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification._id);
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
                // Decrease unread count
                setUnreadNotifications(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark read:', error);
            }
        }

        // Navigation logic based on type
        switch (notification.type) {
            case 'friend_request':
                router.push('/(main)/friends?tab=requests');
                break;
            case 'friend_accept':
                if (notification.sender?._id || notification.data?.userId) {
                    router.push(`/(main)/profile/${notification.sender?._id || notification.data?.userId}`);
                }
                break;
            case 'message':
                if (notification.refId || notification.data?.conversationId) {
                    router.push(`/(main)/chats/${notification.refId || notification.data?.conversationId}`);
                }
                break;
            case 'like':
            case 'comment':
                if (notification.refId || notification.data?.postId) {
                    router.push(`/(main)/social/post/${notification.refId || notification.data?.postId}`);
                }
                break;
            case 'order_status':
            case 'order_update':
            case 'new_order':
                if (notification.refId || notification.data?.orderId) {
                    router.push(`/(main)/orders`);
                }
                break;
            case 'return_request':
            case 'return_update':
                router.push(`/(main)/orders`);
                break;
            case 'shop_reply':
                if (notification.data?.conversationId) {
                    router.push(`/(main)/chats/${notification.data.conversationId}`);
                }
                break;
            default:
                break;
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    { backgroundColor: item.isRead ? colors.background : colors.surface }
                ]}
                onPress={() => handlePress(item)}
            >
                {/* Icon/Avatar based on type */}
                <View style={styles.iconContainer}>
                    {item.sender?.profileImage ? (
                        <Image 
                            source={{ uri: typeof item.sender.profileImage === 'string' ? item.sender.profileImage : 'https://via.placeholder.com/40' }} 
                            style={styles.avatar} 
                        />
                    ) : (
                        <View style={[styles.systemIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="notifications" size={24} color={colors.primary} />
                        </View>
                    )}
                    {/* Small badge for type */}
                    <View style={[styles.typeBadge, { backgroundColor: colors.surface }]}>
                        <Ionicons
                            name={getIconName(item.type)}
                            size={12}
                            color={colors.primary}
                        />
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>

                {!item.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
            </TouchableOpacity>
        );
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'friend_request': return 'person-add';
            case 'friend_accept': return 'people';
            case 'like': return 'heart';
            case 'comment': return 'chatbubble';
            case 'message': return 'mail';
            case 'shop_reply': return 'chatbubbles';
            case 'order_status':
            case 'order_update':
            case 'new_order': return 'cart';
            case 'return_request':
            case 'return_update': return 'return-up-back';
            default: return 'notifications';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {unreadNotifications > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.unreadBadgeText, { color: colors.primary }]}>
                                {unreadNotifications} new
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={() => {
                        notificationService.markAllAsRead();
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        setUnreadNotifications(0);
                    }}>
                        <Text style={{ color: colors.primary }}>Mark all read</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && page === 1 ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary + '40'} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    systemIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
    },
    messageText: {
        fontSize: 15,
        marginBottom: 4,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 12,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 8,
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    unreadBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unreadBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
