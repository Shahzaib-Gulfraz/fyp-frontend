import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Share, Platform, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Post } from '@/src/types/social';
import postService from '@/src/api/postService';
import PostCard from '../../../../components/social/PostCard';
import EmptyState from '../../friends/components/EmptyState';
import { Camera, Image as ImageIcon, ShoppingCart, Bell, Heart } from 'lucide-react-native';
import { useSocket } from '@/src/context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeedScreen() {
    const { theme, tokens } = useTheme();
    const { colors } = theme;
    const { spacing } = tokens;
    const router = useRouter();
    const { unreadNotifications } = useSocket();
    const insets = useSafeAreaInsets();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [cartItemCount, setCartItemCount] = useState(0);

    const loadFeed = async (pageNum = 1, shouldRefresh = false) => {
        if (!shouldRefresh && !hasMore) return;

        try {
            const data = await postService.getFeed(pageNum);

            if (shouldRefresh) {
                setPosts(data.data.posts);
            } else {
                setPosts(prev => [...prev, ...data.data.posts]);
            }

            setHasMore(data.data.pagination.current < data.data.pagination.total);
            setPage(pageNum);
        } catch (error) {
            console.error('Load feed error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadFeed();
        fetchCartCount();
    }, []);

    const fetchCartCount = async () => {
        try {
            const cartService = require('@/src/api/cartService').default;
            const response = await cartService.getCart();
            if (response?.cart?.items) {
                const totalItems = response.cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                setCartItemCount(totalItems);
            }
        } catch (error) {
            console.log('Failed to fetch cart count:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFeed(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadFeed(page + 1);
        }
    };

    const renderFooter = () => {
        if (!hasMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const handleShare = async (post: Post) => {
        try {
            if (Platform.OS === 'web') {
                if (navigator.share) {
                    await navigator.share({
                        title: 'WearVirtually Post',
                        text: `Check out this look by ${post.userId.username}!`,
                        url: post.image,
                    });
                } else {
                    alert(`Link copied to clipboard: ${post.image}`);
                    // In a real app, actually write to clipboard here
                }
            } else {
                await Share.share({
                    message: `Check out this look by ${post.userId.username} on WearVirtually!`,
                    url: post.image, // iOS only
                    title: 'WearVirtually Post' // Android only
                });
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Custom Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 10,
                backgroundColor: colors.background,
                borderBottomColor: colors.divider
            }]}>
                <View style={styles.headerContent}>
                    <Text style={[styles.logo, { color: colors.text }]}>Community Feed</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>

                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
                            onPress={() => router.push("/(main)/notifications")}
                        >
                            <Bell size={24} color={colors.primary} />
                            {unreadNotifications > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                                    <Text style={styles.badgeText}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
                            onPress={() => router.push("/(main)/cart")}
                        >
                            <ShoppingCart size={24} color={colors.primary} />
                            {cartItemCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                                    <Text style={styles.badgeText}>
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface }]}
                            onPress={() => router.push("/(main)/saved-items")}
                        >
                            <Heart size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onCommentPress={() => router.push(`/social/post/${item._id}`)}
                        onUserPress={() => { }}
                        onSharePress={() => handleShare(item)}
                    />
                )}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                        {/* Fallback standard text if EmptyState component varies */}
                        <Text style={{ color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }}>
                            No posts yet. Perform a Virtual Try-On and share your look!
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        fontSize: 22,
        fontWeight: '700',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});
