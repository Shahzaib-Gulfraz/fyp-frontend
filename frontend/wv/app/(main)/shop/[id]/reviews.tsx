import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import shopService from '@/src/api/shopService';

export default function ShopReviewsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, [id]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await shopService.getShopReviews(id as string);
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.reviewItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: item.userId?.avatar?.url || 'https://placehold.co/50x50' }}
                        style={styles.avatar}
                    />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {item.userId?.fullName || 'Anonymous'}
                        </Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Ionicons
                                    key={star}
                                    name={star <= item.rating ? "star" : "star-outline"}
                                    size={14}
                                    color="#FFD700"
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <Text style={[styles.date, { color: colors.text + '80' }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>

            {item.title && <Text style={[styles.reviewTitle, { color: colors.text }]}>{item.title}</Text>}
            {item.comment && <Text style={[styles.reviewComment, { color: colors.text + '99' }]}>{item.comment}</Text>}

            {/* Product Context */}
            {item.productId && (
                <TouchableOpacity
                    style={[styles.productBadge, { backgroundColor: colors.background }]}
                    onPress={() => router.push(`/(main)/buy/${item.productId._id}`)}
                >
                    <Image
                        source={{ uri: item.productId.thumbnail?.url || 'https://placehold.co/50' }}
                        style={styles.productThumb}
                    />
                    <Text style={[styles.productName, { color: colors.text + '90' }]} numberOfLines={1}>
                        {item.productId.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.text + '60'} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Shop Reviews</Text>
                <View style={styles.headerBtn} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-outline" size={48} color={colors.text + '40'} />
                            <Text style={[styles.emptyText, { color: colors.text + '80' }]}>No reviews yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    headerBtn: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    reviewItem: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
    userName: { fontWeight: '600', fontSize: 14 },
    starsRow: { flexDirection: 'row', marginTop: 4 },
    date: { fontSize: 12 },
    reviewTitle: { fontWeight: 'bold', marginBottom: 4 },
    reviewComment: { lineHeight: 20 },
    productBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 8, borderRadius: 8 },
    productThumb: { width: 30, height: 30, borderRadius: 4, marginRight: 8 },
    productName: { flex: 1, fontSize: 12 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 16, fontSize: 16 }
});
