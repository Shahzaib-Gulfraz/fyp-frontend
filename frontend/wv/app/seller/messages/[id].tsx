import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import shopChatService from '@/src/api/shopChatService';
import { Send, X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '@/src/context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/api/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SellerChatScreen() {
    const { id } = useLocalSearchParams(); // Conversation ID
    const conversationId = Array.isArray(id) ? id[0] : id;

    const { colors, isDark } = useTheme();
    const router = useRouter();
    const { socket, isConnected } = useSocket();

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [customer, setCustomer] = useState<any>(null);
    const [shop, setShop] = useState<any>(null);
    const flatListRef = useRef<FlatList>(null);

    // Product detail modal
    const [showProductModal, setShowProductModal] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [productDetails, setProductDetails] = useState<any>(null);

    // Load shop data on mount
    useEffect(() => {
        const loadShopData = async () => {
            try {
                const shopData = await AsyncStorage.getItem('shop');
                if (shopData) {
                    const parsedShop = JSON.parse(shopData);
                    setShop(parsedShop);
                    console.log('[SellerChat] Shop data loaded:', parsedShop._id);
                }
            } catch (error) {
                console.error('[SellerChat] Failed to load shop data:', error);
            }
        };
        loadShopData();
    }, []);

    // Load Messages & Setup Socket Room
    const loadMessages = async () => {
        try {
            setLoading(true);
            console.log('[SellerChat] 📥 Loading messages for conversation:', conversationId);
            const response = await shopChatService.getMessages(conversationId, 1, 50);
            console.log('[SellerChat] 📦 Received response:', response);
            
            // Backend returns { success, data: { messages, conversation, hasMore } }
            const { messages, conversation } = response.data || response; // Handle both structures

            console.log('[SellerChat] 📝 Messages count:', messages?.length, 'Conversation:', conversation?._id);
            setMessages((messages || []).reverse());

            const user = conversation?.participants?.[0] || null;
            setCustomer(user);
            
            if (!user) {
                console.warn('[SellerChat] No customer data found in conversation');
            }

            console.log('[SellerChat] ✅ Messages loaded. getMessages automatically marked as read.');
            // Note: getMessages endpoint already marks messages as read and emits socket event
        } catch (error: any) {
            console.error('[SellerChat] ❌ Failed to load messages:', error);
            console.error('[SellerChat] ❌ Error details:', error.response?.data || error.message);
            if (error.status === 401 || error.message?.includes('token failed')) {
                alert('Session expired. Please login again.');
                router.replace('/shop/login' as any);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[SellerChat] 🔄 useEffect triggered for conversationId:', conversationId);
        loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Join socket room when shop data and socket are ready
    useEffect(() => {
        if (!socket || !shop?._id) {
            console.log('[SellerChat] ❌ Waiting - Socket:', !!socket, 'Connected:', socket?.connected, 'Shop:', !!shop);
            return;
        }

        console.log('[SellerChat] ✅ Socket ready. ID:', socket.id, 'Connected:', socket.connected);
        console.log('[SellerChat] ✅ Joining Shop Room:', shop._id);
        
        if (socket.connected) {
            socket.emit('join', shop._id);
            console.log('[SellerChat] ✅ Join event emitted for shop:', shop._id);
        } else {
            console.log('[SellerChat] ⏳ Socket exists but not connected, waiting for connection...');
            const handleConnect = () => {
                console.log('[SellerChat] ✅ Socket connected event received, joining room:', shop._id);
                socket.emit('join', shop._id);
            };
            socket.on('connect', handleConnect);
            
            return () => {
                socket.off('connect', handleConnect);
            };
        }
    }, [socket, shop, isConnected]);

    // Listen for New Messages
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('[SellerChat] ⏳ Socket not ready. Socket:', !!socket, 'Connected:', isConnected);
            return;
        }

        console.log('[SellerChat] ✅ Setting up new_message listener. Socket ID:', socket.id, 'Conversation:', conversationId);

        const handleNewMessage = (newMessage: any) => {
            console.log('[SellerChat] ✅ new_message event received:', {
                messageId: newMessage._id,
                conversationId: newMessage.conversationId,
                conversationIdType: typeof newMessage.conversationId,
                expectedConversationId: conversationId,
                expectedType: typeof conversationId,
                match: String(newMessage.conversationId) === String(conversationId),
                text: newMessage.text?.substring(0, 20),
                isShopReply: newMessage.isShopReply
            });
            
            // Compare as strings to handle ObjectId vs string comparison
            if (String(newMessage.conversationId) === String(conversationId)) {
                setMessages(prev => {
                    // Prevent duplicates
                    const exists = prev.some(m => m._id === newMessage._id);
                    if (exists) {
                        console.log('[SellerChat] Message already exists, skipping');
                        return prev;
                    }
                    console.log('[SellerChat] ✅ Adding new message to UI');
                    return [...prev, newMessage];
                });
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            } else {
                console.log('[SellerChat] ❌ ConversationId mismatch, ignoring message');
            }
        };

        const handleMessagesRead = (data: any) => {
            console.log('[SellerChat] ✅ messages_read event received:', data);
            // This event means someone marked messages as read
            // We can use it to update the parent conversations list if needed
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            console.log('[SellerChat] 🧹 Cleaning up listeners');
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, isConnected, conversationId]);

    const handleSend = async () => {
        if (!text.trim()) return;

        try {
            setSending(true);
            const response = await shopChatService.replyToInquiry(conversationId, text);
            const newMessage = response.data?.message || response.message;

            // Add message to UI immediately
            setMessages((prev: any[]) => {
                // Check if message already exists (from socket)
                const exists = prev.some(m => m._id === newMessage._id);
                if (!exists) {
                    return [...prev, newMessage];
                }
                return prev;
            });
            setText('');
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        } catch (error) {
            console.error('Failed to send:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleViewProduct = async (productId: string) => {
        try {
            setLoadingProduct(true);
            setShowProductModal(true);
            
            const response = await api.get(`/products/${productId}`);
            setProductDetails(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to load product details:', error);
            alert('Failed to load product details');
            setShowProductModal(false);
        } finally {
            setLoadingProduct(false);
        }
    };

    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/seller/messages')} style={{ marginRight: 12 }}>
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
                        
                        // Debug logging
                        if (item.productMention) {
                            console.log('[SellerChat] Message has productMention:', {
                                productId: item.productMention.productId,
                                productName: item.productMention.productName,
                                productImage: item.productMention.productImage,
                                productPrice: item.productMention.productPrice
                            });
                        }

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

                                    {/* Product Mention - only show if product data exists */}
                                    {item.productMention?.productId && item.productMention?.productName && (
                                        <TouchableOpacity 
                                            style={styles.productCard}
                                            onPress={() => {
                                                console.log('[SellerChat] Opening product modal:', item.productMention.productId);
                                                handleViewProduct(item.productMention.productId);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Image
                                                source={{
                                                    uri: item.productMention.productImage || 'https://placehold.co/60x60/e0e0e0/666?text=Product'
                                                }}
                                                style={styles.productImage}
                                                contentFit="cover"
                                            />
                                            <View style={{ flex: 1, marginLeft: 8 }}>
                                                <Text style={styles.productName} numberOfLines={2}>
                                                    {item.productMention.productName}
                                                </Text>
                                                <Text style={styles.productPrice}>
                                                    ${item.productMention.productPrice?.toFixed(2) || '0.00'}
                                                </Text>
                                            </View>
                                            <View style={styles.viewBadge}>
                                                <Text style={styles.viewBadgeText}>View</Text>
                                            </View>
                                        </TouchableOpacity>
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

            {/* Product Detail Modal */}
            <Modal
                visible={showProductModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProductModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Product Details</Text>
                            <TouchableOpacity onPress={() => setShowProductModal(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        {loadingProduct ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : productDetails ? (
                            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                                {/* Product Image */}
                                <Image
                                    source={{
                                        uri: productDetails.thumbnail?.url || productDetails.images?.[0]?.url || 'https://placehold.co/400x400/e0e0e0/666?text=Product'
                                    }}
                                    style={styles.modalProductImage}
                                    contentFit="cover"
                                />

                                {/* Product Name */}
                                <Text style={styles.modalProductName}>{productDetails.name}</Text>

                                {/* Price */}
                                <View style={styles.priceContainer}>
                                    <Text style={styles.modalProductPrice}>
                                        ${productDetails.price?.toFixed(2)}
                                    </Text>
                                    {productDetails.compareAtPrice && productDetails.compareAtPrice > productDetails.price && (
                                        <Text style={styles.comparePrice}>
                                            ${productDetails.compareAtPrice?.toFixed(2)}
                                        </Text>
                                    )}
                                </View>

                                {/* Stock Status */}
                                <View style={styles.stockContainer}>
                                    <Text style={[
                                        styles.stockText,
                                        { color: productDetails.isInStock ? '#4caf50' : '#f44336' }
                                    ]}>
                                        {productDetails.isInStock ? 'In Stock' : 'Out of Stock'}
                                    </Text>
                                    {productDetails.stockQuantity && (
                                        <Text style={styles.stockQuantity}>
                                            ({productDetails.stockQuantity} available)
                                        </Text>
                                    )}
                                </View>

                                {/* Description */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Description</Text>
                                    <Text style={styles.sectionText}>{productDetails.description}</Text>
                                </View>

                                {/* Brand */}
                                {productDetails.brand && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Brand</Text>
                                        <Text style={styles.sectionText}>{productDetails.brand}</Text>
                                    </View>
                                )}

                                {/* Material */}
                                {productDetails.material && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Material</Text>
                                        <Text style={styles.sectionText}>{productDetails.material}</Text>
                                    </View>
                                )}

                                {/* Colors */}
                                {productDetails.colors && productDetails.colors.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Available Colors</Text>
                                        <View style={styles.tagsContainer}>
                                            {productDetails.colors.map((color: string, index: number) => (
                                                <View key={index} style={styles.tag}>
                                                    <Text style={styles.tagText}>{color}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Sizes */}
                                {productDetails.sizes && productDetails.sizes.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Available Sizes</Text>
                                        <View style={styles.tagsContainer}>
                                            {productDetails.sizes.map((size: string, index: number) => (
                                                <View key={index} style={styles.tag}>
                                                    <Text style={styles.tagText}>{size}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* SKU */}
                                {productDetails.sku && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>SKU</Text>
                                        <Text style={styles.sectionText}>{productDetails.sku}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>
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
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    productImage: { 
        width: 50, 
        height: 50, 
        borderRadius: 8, 
        backgroundColor: isDark ? '#333' : '#f0f0f0'
    },
    productName: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: colors.text,
        marginBottom: 4
    },
    productPrice: { 
        fontSize: 14, 
        fontWeight: 'bold',
        color: colors.primary 
    },
    viewBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 'auto'
    },
    viewBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.9,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalContent: {
        padding: 16,
    },
    modalProductImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: isDark ? '#333' : '#f0f0f0',
    },
    modalProductName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    modalProductPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    comparePrice: {
        fontSize: 18,
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
    },
    stockQuantity: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    tagText: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '500',
    },
});
