import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Search } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../src/context/ThemeContext';

// Mock users
const MOCK_USERS = [
    { id: '1', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Available' },
    { id: '2', name: 'Fashion Hub', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Business Account' },
    { id: '3', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Available' },
    { id: '4', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Away' },
    { id: '5', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Available' },
    { id: '6', name: 'Lisa Anderson', avatar: 'https://i.pravatar.cc/150?u=6', status: 'Available' },
];

export default function NewChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: typeof MOCK_USERS[0] }) => (
        <TouchableOpacity
            style={[styles.userItem, { borderBottomColor: colors.divider }]}
            onPress={() => {
                router.back();
                router.push(`/(main)/chats/${item.id}`);
            }}
        >
            <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
                contentFit="cover"
            />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.userStatus, { color: colors.textSecondary }]}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 16,
                    borderBottomColor: colors.divider
                }
            ]}>
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.text }]}>New Message</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.closeButton, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}
                    >
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1E1E1E' : '#F6F6F6' }]}>
                    <Search size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search users..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
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
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E0E0',
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 4,
    },
    userStatus: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
});
