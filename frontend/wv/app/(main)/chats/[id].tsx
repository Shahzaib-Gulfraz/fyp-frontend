import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../src/context/ThemeContext';

// Mock messages
const MOCK_MESSAGES = [
    { id: '1', text: 'Hi there! I saw your collection and I love it.', sender: 'them', time: '10:00 AM' },
    { id: '2', text: 'Thank you! Is there anything specific you are looking for?', sender: 'me', time: '10:05 AM' },
    { id: '3', text: 'I was wondering if the summer dress is available in size S?', sender: 'them', time: '10:10 AM' },
    { id: '4', text: 'Yes, we have a few pieces left in stock.', sender: 'me', time: '10:12 AM' },
    { id: '5', text: 'Great! Can you send me the link?', sender: 'them', time: '10:15 AM' },
];

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => {
        const isMe = item.sender === 'me';
        return (
            <View style={[
                styles.messageWrapper,
                isMe ? styles.myMessageWrapper : styles.theirMessageWrapper
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMe
                        ? { backgroundColor: '#ff6b00' }
                        : { backgroundColor: isDark ? '#333' : '#F0F0F0' }
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMe
                            ? { color: '#FFFFFF' }
                            : { color: colors.text }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isMe
                            ? { color: 'rgba(255,255,255,0.7)' }
                            : { color: colors.textTertiary }
                    ]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 10,
                    backgroundColor: colors.background,
                    borderBottomColor: colors.divider
                }
            ]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Image
                        source={{ uri: `https://i.pravatar.cc/150?u=${id}` }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    <View>
                        <Text style={[styles.headerName, { color: colors.text }]}>User {id}</Text>
                        <Text style={[styles.headerStatus, { color: colors.success }]}>Online</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerAction}>
                        <Phone size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerAction}>
                        <Video size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[
                    styles.inputContainer,
                    {
                        paddingBottom: Math.max(insets.bottom, 16),
                        backgroundColor: colors.surface,
                        borderTopColor: colors.divider
                    }
                ]}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: isDark ? '#333' : '#F6F6F6',
                                color: colors.text
                            }
                        ]}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: message.trim() ? '#ff6b00' : (isDark ? '#333' : '#E0E0E0') }
                        ]}
                        onPress={handleSend}
                        disabled={!message.trim()}
                    >
                        <Send size={20} color={message.trim() ? '#FFFFFF' : '#999'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#E0E0E0',
    },
    headerName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    headerStatus: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerAction: {
        padding: 8,
        marginLeft: 4,
    },
    messagesList: {
        padding: 20,
    },
    messageWrapper: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    myMessageWrapper: {
        justifyContent: 'flex-end',
    },
    theirMessageWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 10,
        fontFamily: 'Inter_400Regular',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
