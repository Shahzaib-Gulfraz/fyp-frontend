import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocket } from '@/src/context/SocketContext';
import shopChatService from '@/src/api/shopChatService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export default function SellerMessagesList() {
    const { colors, isDark } = useTheme();
    const { socket, setUnreadMessages } = useSocket();
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [shop, setShop] = useState<any>(null);

    const loadConversations = async () => {
        try {
            setLoading(true);
            // Get Shop ID from storage
            const shopData = await AsyncStorage.getItem('shop');
            if (!shopData) {
                console.error('[SellerMessages] No shop data found in storage');
                Alert.alert('Error', 'Shop data not found. Please login again.');
                router.replace('/(auth)/login');
                return;
            }

            const parsedShop = JSON.parse(shopData);
            setShop(parsedShop);

            console.log('[SellerMessages] Fetching conversations for Shop ID:', parsedShop._id);
            const data = await shopChatService.getAllInquiries(parsedShop._id);
            console.log('[SellerMessages] Received conversations:', data.conversations?.length || 0);
            
            // Log unread counts for debugging
            if (data.conversations && data.conversations.length > 0) {
                data.conversations.forEach((conv: any) => {
                    const count = conv.unreadCount?.[parsedShop._id] || 0;
                    if (count > 0) {
                        console.log(`[SellerMessages] 📬 Conversation ${conv._id} has ${count} unread messages`);
                    }
                });
            }
            
            setConversations(data.conversations || []);
            
            // Calculate total unread messages across all conversations
            const totalUnread = (data.conversations || []).reduce((sum: number, conv: any) => {
                return sum + (conv.unreadCount?.[parsedShop._id] || 0);
            }, 0);
            console.log('[SellerMessages] 🔔 Total unread messages:', totalUnread);
            setUnreadMessages(totalUnread);
        } catch (error) {
            console.error('[SellerMessages] Failed to load inquiries:', error);
            Alert.alert('Error', 'Failed to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            console.log('[SellerMessages] Screen focused, reloading conversations...');
            loadConversations();
        }, [])
    );

    // Listen for real-time message updates
    useEffect(() => {
        if (socket && shop?._id) {
            console.log('[SellerMessages] ✅ Setting up socket listeners for shop:', shop._id);
            
            const handleNewMessage = (data: any) => {
                console.log('[SellerMessages] ✅ new_message event received:', data);
                // Reload conversations to update unread counts and last message
                loadConversations();
            };

            const handleMessageRead = (data: any) => {
                console.log('[SellerMessages] ✅ messages_read event received:', data);
                console.log('[SellerMessages] Refreshing conversations to update unread counts...');
                // Small delay to ensure backend has saved the changes
                setTimeout(() => {
                    loadConversations();
                }, 300);
            };

            socket.on('new_message', handleNewMessage);
            socket.on('message:new', handleNewMessage);
            socket.on('messages_read', handleMessageRead);

            return () => {
                console.log('[SellerMessages] 🧹 Cleaning up socket listeners');
                socket.off('new_message', handleNewMessage);
                socket.off('message:new', handleNewMessage);
                socket.off('messages_read', handleMessageRead);
            };
        }
    }, [socket, shop?._id]);

    const renderItem = ({ item }: { item: any }) => {
        // Participant is the USER (customer)
        const customer = item.participants?.[0] || {};
        const lastMsg = item.lastMessage;
        const unreadCount = item.unreadCount?.[shop?._id] || 0;
        const isUnread = unreadCount > 0;
        
        // Safely get profile image URL
        const profileImageUrl = typeof customer?.profileImage === 'string' 
            ? customer.profileImage 
            : (customer?.profileImage as any)?.url || 'https://via.placeholder.com/50';

        const handlePress = () => {
            console.log('[SellerMessages] 👆 Conversation pressed:', item._id, 'Unread:', unreadCount);
            
            // Optimistically clear unread count in UI
            if (isUnread && shop?._id) {
                console.log('[SellerMessages] 🔄 Optimistically clearing unread count...');
                setConversations(prev => prev.map(conv => {
                    if (conv._id === item._id) {
                        const updatedConv = { ...conv };
                        // Create a new unreadCount object with the shop's count set to 0
                        updatedConv.unreadCount = { 
                            ...updatedConv.unreadCount, 
                            [shop._id]: 0 
                        };
                        console.log('[SellerMessages] ✅ Updated conversation unreadCount:', updatedConv.unreadCount);
                        return updatedConv;
                    }
                    return conv;
                }));
                
                // Update global unread count
                const newTotal = Math.max(0, (conversations.reduce((sum, conv) => {
                    if (conv._id === item._id) return sum; // Skip this conversation
                    return sum + (conv.unreadCount?.[shop._id] || 0);
                }, 0)));
                
                console.log('[SellerMessages] 🔔 Updating global unread from', unreadCount, 'conversations to:', newTotal);
                setUnreadMessages(newTotal);
            }
            router.push(`/seller/messages/${item._id}`);
        };

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: colors.card },
                    isUnread && { borderLeftWidth: 4, borderLeftColor: colors.primary }
                ]}
                onPress={handlePress}
            >
                <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.avatar}
                />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.name, { color: colors.text }]}>
                            {customer?.fullName || customer?.username || 'Customer'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {lastMsg && (
                                <Text style={styles.time}>
                                    {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                                </Text>
                            )}
                            {isUnread && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <Text style={[styles.message, { color: isDark ? '#aaa' : '#666' }]} numberOfLines={1}>
                        {lastMsg?.sender === shop?._id ? 'You: ' : ''}{lastMsg?.text || 'No messages yet'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.replace('/seller/dashboard')}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Customer Inquiries</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: isDark ? '#aaa' : '#666' }}>No messages yet</Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: colors.text
    },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd' },
    content: { flex: 1, marginLeft: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: '600' },
    time: { fontSize: 12, color: '#999' },
    message: { fontSize: 14 },
    unreadBadge: {
        backgroundColor: '#FF3B30',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6
    },
    unreadText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold'
    }
});
