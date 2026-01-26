import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Package, X, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocket } from '@/src/context/SocketContext';
import shopChatService from '@/src/api/shopChatService';
import { ProductMentionCard } from '@/components/chat/ProductMentionCard';
import { Image } from 'expo-image';

/**
 * Shop Chat Screen
 * Allows users to chat with shop owners and mention products
 */
export default function ShopChatScreen() {
    const { shopId } = useLocalSearchParams();
    const { theme } = useTheme();
    const { socket } = useSocket();
    const router = useRouter();
    const styles = getStyles(theme.colors);
    const flatListRef = useRef<FlatList>(null);

    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Typing indicator
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Product picker state
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productSearch, setProductSearch] = useState('');

    // Quick reply templates
    const quickReplies = [
        "What's the price?",
        "Is this available?",
        "Can I get more details?",
        "What are the shipping options?",
    ];

    // Load conversation and messages
    useEffect(() => {
        loadConversation();
    }, [shopId]);

    // Listen for new messages and typing indicators
    useEffect(() => {
        if (!socket || !conversation) return;

        const handleNewMessage = (message: any) => {
            if (message.conversationId === conversation._id) {
                setMessages(prev => [message, ...prev]);
                setIsTyping(false); // Stop typing indicator on message
                scrollToBottom();

                // Mark as read since user is viewing the chat
                shopChatService.markAsRead(conversation._id);
            }
        };

        const handleUserTyping = ({ conversationId }: any) => {
            if (conversationId === conversation._id) {
                setIsTyping(true);
            }
        };

        const handleUserStoppedTyping = ({ conversationId }: any) => {
            if (conversationId === conversation._id) {
                setIsTyping(false);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
        };
    }, [socket, conversation]);

    const loadConversation = async () => {
        try {
            setLoading(true);
            const response = await shopChatService.getOrCreateConversation(shopId as string);
            setConversation(response.data.conversation);

            // Load initial messages
            const { messages, hasMore } = await shopChatService.getMessages(response.data.conversation._id, 1, 50);
            setMessages(messages || []); // Ensure array
            setHasMore(hasMore);

            setLoading(false);
        } catch (error) {
            console.error('Failed to load conversation:', error);
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await shopChatService.getShopProducts(shopId as string, productSearch);
            setProducts(response.data.products);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    useEffect(() => {
        if (showProductPicker) {
            loadProducts();
        }
    }, [showProductPicker, productSearch]);

    const handleSendMessage = async () => {
        if (!messageText.trim() && !selectedProduct) return;

        try {
            setSending(true);

            // Stop typing indicator
            if (socket && conversation) {
                socket.emit('stopped_typing', { conversationId: conversation._id, userId: conversation.participants[0]._id });
            }

            const response = await shopChatService.sendMessage(
                shopId as string,
                messageText.trim() || `Check out this product!`,
                selectedProduct?._id
            );

            const newMessage = response.data.message;
            setMessages(prev => [newMessage, ...prev]);
            setMessageText('');
            setSelectedProduct(null);
            scrollToBottom();
        } catch (error: any) {
            console.error('Failed to send message:', error);
            alert(`Failed to send: ${error.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };

    const handleTextChange = (text: string) => {
        setMessageText(text);

        // Emit typing indicator
        if (socket && conversation) {
            socket.emit('typing', { conversationId: conversation._id, userId: conversation.participants[0]._id });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopped_typing', { conversationId: conversation._id, userId: conversation.participants[0]._id });
            }, 2000);
        }
    };

    const loadMoreMessages = async () => {
        if (loadingMore || !hasMore || !conversation) return;

        try {
            setLoadingMore(true);
            const { messages: newMessages, hasMore: moreAvailable } = await shopChatService.getMessages(conversation._id, page + 1);

            if (newMessages && newMessages.length > 0) {
                setMessages(prev => [...prev, ...newMessages]);
                setPage(prev => prev + 1);
                setHasMore(moreAvailable);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMyMessage = item.sender === conversation?.participants[0]?._id;

        return (
            <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
                <View style={[styles.messageBubble, isMyMessage && styles.myMessageBubble]}>
                    <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                        {item.text}
                    </Text>
                    {item.productMention && (
                        <ProductMentionCard product={item.productMention} theme={theme} />
                    )}
                    <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    const renderProductPicker = () => (
        <Modal
            visible={showProductPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowProductPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.productPickerContainer}>
                    <View style={styles.productPickerHeader}>
                        <Text style={styles.productPickerTitle}>Select Product</Text>
                        <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                            <X size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.productSearchInput}
                        placeholder="Search products..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={productSearch}
                        onChangeText={setProductSearch}
                    />

                    <FlatList
                        data={products}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={() => {
                                    setSelectedProduct(item);
                                    setShowProductPicker(false);
                                }}
                            >
                                <Image
                                    source={{ 
                                        uri: (() => {
                                            const firstImg = item.images?.[0];
                                            const thumb = item.thumbnail;
                                            const imgUrl = typeof firstImg === 'string' ? firstImg : (firstImg as any)?.url;
                                            const thumbUrl = typeof thumb === 'string' ? thumb : (thumb as any)?.url;
                                            return imgUrl || thumbUrl || 'https://placehold.co/60';
                                        })()
                                    }}
                                    style={styles.productItemImage}
                                    contentFit="cover"
                                />
                                <View style={styles.productItemDetails}>
                                    <Text style={styles.productItemName}>{item.name}</Text>
                                    <Text style={styles.productItemPrice}>${item.price?.toFixed(2)}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/chats')} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.shopName}>{conversation?.shopId?.shopName || 'Shop'}</Text>
                    <Text style={styles.shopStatus}>Online</Text>
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id}
                    inverted
                    contentContainerStyle={styles.messagesList}
                    onEndReached={loadMoreMessages}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loadingMore ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />
                    ) : null}
                />

                {/* Typing Indicator */}
                {isTyping && (
                    <View style={styles.typingIndicator}>
                        <View style={styles.typingDots}>
                            <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                            <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                            <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                        </View>
                        <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>Shop is typing...</Text>
                    </View>
                )}

                {/* Quick Replies */}
                {messages.length === 0 && (
                    <View style={styles.quickRepliesContainer}>
                        <Text style={[styles.quickRepliesLabel, { color: theme.colors.textSecondary }]}>Quick replies:</Text>
                        <View style={styles.quickRepliesRow}>
                            {quickReplies.map((reply, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.quickReplyChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setMessageText(reply)}
                                >
                                    <Text style={[styles.quickReplyText, { color: theme.colors.text }]}>{reply}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Selected Product Preview */}
                {selectedProduct && (
                    <View style={styles.selectedProductPreview}>
                        <Text style={styles.selectedProductLabel}>Mentioning:</Text>
                        <View style={styles.selectedProductCard}>
                            <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                                <X size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.productButton}
                        onPress={() => setShowProductPicker(true)}
                    >
                        <Package size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={messageText}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={500}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, (!messageText.trim() && !selectedProduct) && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={sending || (!messageText.trim() && !selectedProduct)}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Send size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {renderProductPicker()}
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backButton: {
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    shopStatus: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 2,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '75%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 12,
    },
    myMessageBubble: {
        backgroundColor: colors.primary,
    },
    messageText: {
        fontSize: 15,
        color: colors.text,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    messageTime: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    selectedProductPreview: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    selectedProductLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    selectedProductCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: 8,
    },
    selectedProductName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    productButton: {
        padding: 8,
        marginRight: 8,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: colors.text,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    productPickerContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    productPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productPickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    productSearchInput: {
        margin: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: colors.text,
    },
    productItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    productItemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productItemName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    productItemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    // Typing Indicator Styles
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        marginTop: 4,
    },
    typingDots: {
        flexDirection: 'row',
        marginRight: 8,
        height: 10,
        alignItems: 'center',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
        opacity: 0.6,
    },
    typingText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    // Quick Reply Styles
    quickRepliesContainer: {
        padding: 16,
        paddingTop: 8,
    },
    quickRepliesLabel: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '500',
    },
    quickRepliesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quickReplyChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    quickReplyText: {
        fontSize: 13,
    },
});
