import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Plus, MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../src/context/ThemeContext';

// Mock data for chats
const MOCK_CHATS = [
    {
        id: '1',
        user: {
            name: 'Sarah Wilson',
            avatar: 'https://i.pravatar.cc/150?u=1',
            online: true,
        },
        lastMessage: 'The dress fits perfectly! Thank you so much.',
        time: '2m ago',
        unread: 2,
    },
    {
        id: '2',
        user: {
            name: 'Fashion Hub',
            avatar: 'https://i.pravatar.cc/150?u=2',
            online: false,
        },
        lastMessage: 'Your order #12345 has been shipped.',
        time: '1h ago',
        unread: 0,
    },
    {
        id: '3',
        user: {
            name: 'Michael Chen',
            avatar: 'https://i.pravatar.cc/150?u=3',
            online: true,
        },
        lastMessage: 'Do you have this in blue?',
        time: '3h ago',
        unread: 1,
    },
    {
        id: '4',
        user: {
            name: 'Emma Davis',
            avatar: 'https://i.pravatar.cc/150?u=4',
            online: false,
        },
        lastMessage: 'Thanks for the quick delivery!',
        time: '1d ago',
        unread: 0,
    },
];

export default function ChatsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = MOCK_CHATS.filter(chat =>
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: typeof MOCK_CHATS[0] }) => (
        <TouchableOpacity
            style={[styles.chatItem, { borderBottomColor: colors.divider }]}
            onPress={() => router.push(`/(main)/chats/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: item.user.avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                {item.user.online && (
                    <View style={[styles.onlineIndicator, { borderColor: colors.background }]} />
                )}
            </View>

            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
                    <Text style={[styles.time, { color: colors.textTertiary }]}>{item.time}</Text>
                </View>

                <View style={styles.messageContainer}>
                    <Text
                        style={[
                            styles.lastMessage,
                            {
                                color: item.unread > 0 ? colors.text : colors.textSecondary,
                                fontWeight: item.unread > 0 ? '600' : '400',
                                fontFamily: item.unread > 0 ? 'Inter_600SemiBold' : 'Inter_400Regular'
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>

                    {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 16,
                        backgroundColor: colors.background,
                        borderBottomColor: colors.divider
                    }
                ]}
            >
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
                    <TouchableOpacity
                        style={[styles.newChatButton, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}
                        onPress={() => router.push('/(main)/chats/new')}
                    >
                        <Plus size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1E1E1E' : '#F6F6F6' }]}>
                    <Search size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search messages..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredChats}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MessageCircle size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No messages found
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
    },
    newChatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
    listContent: {
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E0E0E0',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    time: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        marginRight: 8,
    },
    unreadBadge: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
    },
});
