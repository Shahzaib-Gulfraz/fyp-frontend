import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import shopService from '@/src/api/shopService';
import categoryService from '@/src/api/categoryService';
import shopChatService from '@/src/api/shopChatService';
import { useSocket } from '@/src/context/SocketContext';
import { useUser } from '@/src/context/UserContext';

export default function ShopProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();

    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Follow State
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    // Chat Badge State
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();
    const { user } = useUser();

    useEffect(() => {
        loadData();
        loadUnreadCount();
    }, [id]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (message: any) => {
            // If message is from this shop (logic depends on how we identify sender as shop)
            // Or simply if conversationId matches our shop conversation
            // For now, simpler: reload unread count if we get a message and we are not in chat
            // Ideally we check if message.sender !== user._id
            if (message.sender !== user._id) {
                loadUnreadCount(); // Refresh count on new message
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, user, id]);

    const loadUnreadCount = async () => {
        try {
            // We can re-use getOrCreateConversation to get unread count
            const response = await shopChatService.getOrCreateConversation(id as string);
            const conv = response.data.conversation;
            if (conv && conv.unreadCount && user?._id) {
                // Cast to any to avoid TS index signature error since it comes from JSON
                const counts = conv.unreadCount as any;
                setUnreadCount(counts[user._id] || 0);
            }
        } catch (error) {
            console.log('Failed to load unread count:', error);
        }
    };

    useEffect(() => {
        if (shop) {
            loadProducts();
        }
    }, [selectedCategory, searchQuery]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [shopData, categoriesData, followStatus] = await Promise.all([
                shopService.getShop(id as string),
                categoryService.getAllCategories(),
                shopService.checkFollowStatus(id as string)
            ]);

            setShop(shopData.shop);
            setFollowersCount(shopData.shop.followersCount || 0);
            setCategories(categoriesData.categories || []);
            setIsFollowing(followStatus.isFollowing);

            const productsData = await shopService.getShopProducts(id as string);
            setProducts(productsData.products || []);
        } catch (error) {
            console.error('Failed to load shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const filters: any = {};
            if (searchQuery) filters.search = searchQuery;
            if (selectedCategory) filters.category = selectedCategory;

            const response = await shopService.getShopProducts(id as string, filters);
            setProducts(response.products || []);
        } catch (error) {
            console.error('Failed to filter products:', error);
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await shopService.unfollowShop(id as string);
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
            } else {
                await shopService.followShop(id as string);
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Follow toggle failed:', error);
            alert('Failed to update follow status');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const LoadingSkeleton = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    if (loading && !shop) return <LoadingSkeleton />;

    if (!shop) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>Shop not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={{ color: colors.primary }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    {shop.shopName}
                </Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="share-social-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                stickyHeaderIndices={[2]}
            >
                {/* Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: shop.banner?.url || 'https://placehold.co/800x200/png?text=Shop+Banner' }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay} />
                </View>

                {/* Info Card */}
                <View style={[styles.shopInfoCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.shopHeaderRow}>
                        <Image
                            source={{ uri: shop.logo?.url || 'https://placehold.co/100x100/png?text=Logo' }}
                            style={[styles.shopLogo, { borderColor: colors.background }]}
                        />
                        <View style={styles.shopMeta}>
                            <Text style={[styles.shopName, { color: colors.text }]}>{shop.shopName}</Text>

                            <TouchableOpacity
                                style={styles.ratingRow}
                                onPress={() => router.push(`/(main)/shop/${id}/reviews`)}
                            >
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: colors.text }]}>
                                    {shop.stats?.rating?.toFixed(1) || '0.0'} <Text style={{ color: colors.text + '80', textDecorationLine: 'underline' }}>
                                        ({shop.stats?.reviewsCount || 0} Reviews)
                                    </Text>
                                </Text>
                                <Ionicons name="chevron-forward" size={12} color={colors.text + '80'} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.followBtn,
                                {
                                    backgroundColor: isFollowing ? colors.surface : colors.primary,
                                    borderWidth: isFollowing ? 1 : 0,
                                    borderColor: colors.primary
                                }
                            ]}
                            onPress={handleFollowToggle}
                        >
                            <Text style={[
                                styles.followBtnText,
                                { color: isFollowing ? colors.primary : '#fff' }
                            ]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {shop.description && (
                        <Text style={[styles.description, { color: colors.text + '99' }]} numberOfLines={2}>
                            {shop.description}
                        </Text>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{products.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Products</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{followersCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Followers</Text>
                        </View>
                    </View>
                </View>

                {/* Search & Filter */}
                <View style={[styles.searchContainer, { backgroundColor: colors.background, paddingVertical: 10 }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                        <Ionicons name="search" size={20} color={colors.text + '80'} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={`Search in ${shop.shopName}`}
                            placeholderTextColor={colors.text + '80'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.text + '80'} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                { backgroundColor: selectedCategory === null ? colors.primary : colors.surface, borderColor: colors.border }
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[styles.categoryChipText, { color: selectedCategory === null ? '#fff' : colors.text }]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat._id}
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: selectedCategory === cat._id ? colors.primary : colors.surface, borderColor: colors.border }
                                ]}
                                onPress={() => setSelectedCategory(cat._id === selectedCategory ? null : cat._id)}
                            >
                                <Text style={[styles.categoryChipText, { color: selectedCategory === cat._id ? '#fff' : colors.text }]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Grid */}
                <View style={styles.productsContainer}>
                    {products.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="shirt-outline" size={48} color={colors.text + '40'} />
                            <Text style={[styles.emptyText, { color: colors.text + '80' }]}>No products found</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {products.map((item) => (
                                <View key={item._id} style={{ width: '48%', marginBottom: 16 }}>
                                    <TouchableOpacity
                                        style={[styles.productItem, { backgroundColor: colors.surface }]}
                                        onPress={() => router.push(`/(main)/buy/${item._id}`)}
                                    >
                                        <Image
                                            source={{ uri: item.thumbnail?.url || 'https://placehold.co/300x300' }}
                                            style={styles.productImage}
                                        />
                                        <View style={styles.productDetails}>
                                            <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <Text style={[styles.productPrice, { color: colors.primary }]}>
                                                PKR {item.price.toLocaleString()}
                                            </Text>
                                            <View style={styles.productRating}>
                                                <Ionicons name="star" size={12} color="#FFD700" />
                                                <Text style={[styles.ratingVal, { color: colors.text + '80' }]}>
                                                    {item.stats?.rating?.toFixed(1) || '0.0'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Floating Chat Button */}
            <TouchableOpacity
                style={[styles.chatButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                    setUnreadCount(0); // Clear badge immediately on click
                    router.push(`/(main)/chats/shop/${id}`);
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... existing styles ...
    chatButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    errorText: { fontSize: 16 },
    backButton: { padding: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    bannerContainer: { height: 150, width: '100%', position: 'relative' },
    bannerImage: { width: '100%', height: 100 }, // Fixed height style issue from previous snippet? Let's keep original unless I need to fix it.
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
    shopInfoCard: { margin: 16, marginTop: -40, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    shopHeaderRow: { flexDirection: 'row', alignItems: 'center' },
    shopLogo: { width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
    shopMeta: { flex: 1, marginLeft: 12 },
    shopName: { fontSize: 18, fontWeight: 'bold' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    ratingText: { fontSize: 12, fontWeight: '600' },
    followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    followBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    description: { fontSize: 14, marginTop: 12, lineHeight: 20 },
    statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eee' },
    statItem: { flex: 1, alignItems: 'center' },
    divider: { width: 1, backgroundColor: '#eee' },
    statValue: { fontSize: 16, fontWeight: 'bold' },
    statLabel: { fontSize: 12, marginTop: 2 },
    searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, padding: 0 },
    categoryScroll: { marginTop: 4, marginHorizontal: -16 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
    categoryChipText: { fontSize: 13, fontWeight: '500' },
    productsContainer: { padding: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 16 },
    productItem: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', height: 240 },
    productImage: { width: '100%', height: 150, backgroundColor: '#f0f0f0' },
    productDetails: { padding: 10, flex: 1, justifyContent: 'space-between' },
    productTitle: { fontSize: 14, fontWeight: '500' },
    productPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    productRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingVal: { fontSize: 10 },
});
