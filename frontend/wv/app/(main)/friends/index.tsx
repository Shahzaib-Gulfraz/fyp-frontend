import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, UserPlus, Search, X, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import friendService from '@/src/api/friendService';
import { chatService } from '@/src/api/chatService';
import FriendCard from './components/FriendCard';
import FriendRequestCard from './components/FriendRequestCard';
import EmptyState from './components/EmptyState';
import { LucideIcon } from 'lucide-react-native';

type TabType = 'friends' | 'requests' | 'suggestions';

interface Friend {
    id: string;
    username: string;
    fullName: string;
    profileImage?: { url: string } | string;
    bio?: string;
    isOnline?: boolean;
    lastSeen?: string | Date;
}

interface FriendRequestRef {
    requestId: string;
    from: Friend;
    createdAt: string | Date;
}

interface Suggestion {
    _id: string;
    username: string;
    fullName: string;
    profileImage?: { url: string } | string;
    bio?: string;
    mutualFriendsCount?: number;
    friendsCount?: number;
}

/**
 * Friends Screen
 * Main screen showing friends list, pending requests, and search
 */
const FriendsScreen = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { spacing, radius, fonts } = appTheme.tokens;

    // State
    const [activeTab, setActiveTab] = useState<TabType>('friends');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequestRef[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'friends') {
                await loadFriends();
            } else if (activeTab === 'requests') {
                await loadPendingRequests();
            } else if (activeTab === 'suggestions') {
                await loadSuggestions();
            }
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFriends = async () => {
        try {
            const response = await friendService.getFriends({ search: searchQuery });
            setFriends(response.data.friends);
        } catch (error) {
            console.error('Load friends error:', error);
        }
    };

    const loadPendingRequests = async () => {
        try {
            const response = await friendService.getPendingRequests();
            setPendingRequests(response.data.requests);
        } catch (error) {
            console.error('Load requests error:', error);
        }
    };

    const loadSuggestions = async () => {
        try {
            console.log('Loading suggestions with search:', searchQuery);
            const response = await friendService.getFriendSuggestions({
                limit: 20,
                search: searchQuery
            });
            console.log('Suggestions response:', response.data);
            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error('Load suggestions error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [activeTab]);

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await friendService.acceptFriendRequest(requestId);
            await loadPendingRequests();
            await loadFriends();
        } catch (error) {
            console.error('Accept request error:', error);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await friendService.rejectFriendRequest(requestId);
            await loadPendingRequests();
        } catch (error) {
            console.error('Reject request error:', error);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await friendService.sendFriendRequest(userId);
            await loadSuggestions();
        } catch (error) {
            console.error('Send request error:', error);
        }
    };

    const handleRemoveFriend = async (userId: string) => {
        try {
            await friendService.removeFriend(userId);
            await loadFriends();
        } catch (error) {
            console.error('Remove friend error:', error);
        }
    };

    const handleSearch = async () => {
        if (activeTab === 'friends') {
            await loadFriends();
        } else if (activeTab === 'suggestions') {
            await loadSuggestions();
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (activeTab === 'friends') {
            loadFriends();
        } else if (activeTab === 'suggestions') {
            loadSuggestions();
        }
    };

    const renderTabButton = (tab: TabType, label: string, icon: LucideIcon) => {
        const isActive = activeTab === tab;
        const Icon = icon;

        return (
            <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                    styles.tabButton,
                    {
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderRadius: radius.md,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                    },
                ]}
            >
                <Icon
                    size={18}
                    color={isActive ? '#fff' : colors.text}
                    style={{ marginRight: spacing.xs }}
                />
                <Text
                    style={[
                        styles.tabLabel,
                        {
                            color: isActive ? '#fff' : colors.text,
                            fontFamily: isActive ? fonts.semiBold : fonts.regular,
                        },
                    ]}
                >
                    {label}
                </Text>
                {tab === 'requests' && pendingRequests.length > 0 && (
                    <View
                        style={[
                            styles.badge,
                            {
                                backgroundColor: isActive ? '#fff' : colors.error,
                                marginLeft: spacing.xs,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                {
                                    color: isActive ? colors.primary : '#fff',
                                    fontFamily: fonts.bold,
                                },
                            ]}
                        >
                            {pendingRequests.length}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }

        if (activeTab === 'friends') {
            if (friends.length === 0) {
                return (
                    <EmptyState
                        icon={Users}
                        title="No Friends Yet"
                        message="Start connecting with people by sending friend requests!"
                        actionLabel="Find Friends"
                        onAction={() => setActiveTab('suggestions')}
                    />
                );
            }

            return (
                <View style={{ paddingHorizontal: spacing.lg }}>
                    {friends.map((friend) => (
                        <FriendCard
                            key={friend.id}
                            friend={friend}
                            onRemove={() => handleRemoveFriend(friend.id)}
                            onPress={() => router.push(`/social/profile/${friend.id}`)}
                            onMessage={async () => {
                                try {
                                    setLoading(true);
                                    const response = await chatService.startChat(friend.id);
                                    if (response.data?.success && response.data?.data?.conversation) {
                                        router.push(`/chats/${response.data.data.conversation._id}`);
                                    } else {
                                        console.error('Invalid response format', response.data);
                                    }
                                } catch (error) {
                                    console.error('Start chat error:', error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />
                    ))}
                </View>
            );
        }

        if (activeTab === 'requests') {
            if (pendingRequests.length === 0) {
                return (
                    <EmptyState
                        icon={UserPlus}
                        title="No Pending Requests"
                        message="You don't have any friend requests at the moment."
                    />
                );
            }

            return (
                <View style={{ paddingHorizontal: spacing.lg }}>
                    {pendingRequests.map((request) => (
                        <FriendRequestCard
                            key={request.requestId}
                            request={request}
                            onAccept={() => handleAcceptRequest(request.requestId)}
                            onReject={() => handleRejectRequest(request.requestId)}
                        />
                    ))}
                </View>
            );
        }

        if (activeTab === 'suggestions') {
            if (suggestions.length === 0) {
                return (
                    <EmptyState
                        icon={Search}
                        title="No Suggestions"
                        message="We couldn't find any friend suggestions for you right now."
                    />
                );
            }

            return (
                <View style={{ paddingHorizontal: spacing.lg }}>
                    {suggestions.map((suggestion) => (
                        <FriendCard
                            key={suggestion._id}
                            friend={suggestion}
                            showAddButton
                            onAdd={() => handleSendRequest(suggestion._id)}
                            onPress={() => router.push(`/social/profile/${suggestion._id}`)}
                        />
                    ))}
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text
                    style={[
                        styles.headerTitle,
                        { color: colors.text, fontFamily: fonts.bold },
                    ]}
                >
                    Friends
                </Text>
            </View>

            {/* Search Bar (for friends and suggestions tabs) */}
            {(activeTab === 'friends' || activeTab === 'suggestions') && (
                <View
                    style={[
                        styles.searchContainer,
                        {
                            paddingHorizontal: spacing.lg,
                            paddingVertical: spacing.md,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.searchBar,
                            {
                                backgroundColor: colors.surface,
                                borderRadius: radius.md,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                            },
                        ]}
                    >
                        <Search size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[
                                styles.searchInput,
                                {
                                    color: colors.text,
                                    fontFamily: fonts.regular,
                                    marginLeft: spacing.sm,
                                },
                            ]}
                            placeholder={activeTab === 'friends' ? 'Search friends...' : 'Search users...'}
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch}>
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Tabs */}
            <View
                style={[
                    styles.tabsContainer,
                    {
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                    },
                ]}
            >
                {renderTabButton('friends', 'Friends', Users)}
                {renderTabButton('requests', 'Requests', UserPlus)}
                {renderTabButton('suggestions', 'Suggestions', Search)}
            </View>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
    },
    searchContainer: {},
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 14,
    },
    badge: {
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
});

export default FriendsScreen;
