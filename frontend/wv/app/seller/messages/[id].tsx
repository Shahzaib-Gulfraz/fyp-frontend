import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import shopChatService from '@/src/api/shopChatService';
import { Send } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '@/src/context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/api/config';

export default function SellerChatScreen() {
    const { id } = useLocalSearchParams(); // Conversation ID
    const conversationId = Array.isArray(id) ? id[0] : id;

    const { colors, isDark } = useTheme();
    const router = useRouter();
    const { socket } = useSocket();

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [customer, setCustomer] = useState<any>(null);
    const [shop, setShop] = useState<any>(null);
    const flatListRef = useRef<FlatList>(null);

    // Load Messages & Setup Socket Room
    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await shopChatService.getMessages(conversationId, 1, 50);
            // Backend returns { success, data: { messages, conversation, hasMore } }
            const { messages, conversation } = response.data || response; // Handle both structures

            setMessages((messages || []).reverse());

            const user = conversation?.participants?.[0] || null;
            setCustomer(user);
            
            if (!user) {
                console.warn('[SellerChat] No customer data found in conversation');
            }

            // Get Shop ID to join room
            const shopData = await AsyncStorage.getItem('shop');
            if (shopData) {
                const parsedShop = JSON.parse(shopData);
                setShop(parsedShop);

                // Join Shop Room manually
                if (socket && parsedShop._id) {
                    console.log('[SellerChat] Joining Shop Room:', parsedShop._id);
                    socket.emit('join', parsedShop._id);
                }
            }
        } catch (error: any) {
            console.error('Failed to load messages:', error);
            if (error.status === 401 || error.message?.includes('token failed')) {
                alert('Session expired. Please login again.');
                router.replace('/shop/login' as any);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, [conversationId]);

    // Ensure socket joins room if socket connects later
    useEffect(() => {
        if (socket && shop?._id) {
            console.log('[SellerChat] Socket connected state:', socket.connected, 'ID:', socket.id);
            console.log('[SellerChat] Joining Shop Room:', shop._id);
            socket.emit('join', shop._id);
        } else {
            console.log('[SellerChat] Waiting for socket or shop ID. Socket:', !!socket, 'Shop:', !!shop);
        }
    }, [socket, shop]);

    // Listen for New Messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: any) => {
            console.log('[SellerChat] New message received:', newMessage);
            if (newMessage.conversationId === conversationId) {
                setMessages(prev => [...prev, newMessage]);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, conversationId]);

    const handleSend = async () => {
        if (!text.trim()) return;

        try {
            setSending(true);
            const response = await shopChatService.replyToInquiry(conversationId, text);
            const newMessage = response.data?.message || response.message;

            setMessages((prev: any[]) => [...prev, newMessage]);
            setText('');

        } catch (error) {
            console.error('Failed to send:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Image
                    source={{
                        uri: typeof customer?.profileImage === 'string'
                            ? customer.profileImage
                            : (customer?.profileImage as any)?.url || 'https://via.placeholder.com/40'
                    }}
                    style={styles.headerAvatar}
                />

                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.headerTitle}>
                        {customer?.fullName || customer?.username || 'Customer'}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: isDark ? '#aaa' : '#666' }]}>User</Text>
                </View>
            </View>

            {/* Chat Area */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => {
                        const isMyMessage = item.isShopReply;

                        return (
                            <View style={[
                                styles.bubbleContainer,
                                isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
                            ]}>
                                <View style={[
                                    styles.bubble,
                                    isMyMessage ? styles.myBubble : styles.theirBubble
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isMyMessage ? styles.myMessageText : styles.theirMessageText
                                    ]}>
                                        {item.text}
                                    </Text>

                                    {/* Product Mention? */}
                                    {item.productMention && (
                                        <View style={styles.productCard}>
                                            <Image
                                                source={{
                                                    uri: typeof item.productMention.productImage === 'string'
                                                        ? item.productMention.productImage
                                                        : (item.productMention.productImage as any)?.url || 'https://via.placeholder.com/60'
                                                }}
                                                style={styles.productImage}
                                            />
                                            <View>
                                                <Text style={styles.productName}>{item.productMention.productName}</Text>
                                                <Text style={styles.productPrice}>${item.productMention.productPrice}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a reply..."
                        placeholderTextColor={isDark ? '#aaa' : '#666'}
                        value={text}
                        onChangeText={setText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !text.trim() && { opacity: 0.5 }]}
                        onPress={handleSend}
                        disabled={sending || !text.trim()}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card
    },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    headerSubtitle: { fontSize: 12 },

    // Bubble
    bubbleContainer: { marginBottom: 12, flexDirection: 'row', width: '100%' },
    myMessageContainer: { justifyContent: 'flex-end' }, // Right align
    theirMessageContainer: { justifyContent: 'flex-start' }, // Left align

    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    myBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 2,
    },
    theirBubble: {
        backgroundColor: isDark ? '#333' : '#f0f0f0',
        borderBottomLeftRadius: 2,
    },

    messageText: { fontSize: 15 },
    myMessageText: { color: '#fff' },
    theirMessageText: { color: colors.text },

    // Input
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.card
    },
    input: {
        flex: 1,
        backgroundColor: isDark ? '#222' : '#f9f9f9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: colors.text,
        marginRight: 10,
        maxHeight: 100
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // Product
    productCard: {
        flexDirection: 'row',
        marginTop: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center'
    },
    productImage: { width: 40, height: 40, borderRadius: 4, marginRight: 8 },
    productName: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
    productPrice: { fontSize: 12, color: '#eee' }
});
