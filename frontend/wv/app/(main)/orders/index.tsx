import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import orderService from '@/src/api/orderService';
import reviewService from '@/src/api/reviewService';
import returnService from '@/src/api/returnService';

const STATUS_FILTERS = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_COLORS = {
    pending: '#FFA500',
    confirmed: '#2196F3',
    processing: '#9C27B0',
    shipped: '#FF9800',
    delivered: '#4CAF50',
    cancelled: '#F44336',
};

export default function OrdersScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
    const [orderReturns, setOrderReturns] = useState<{ [key: string]: any }>({});

    useFocusEffect(
        React.useCallback(() => {
            loadUserReviews();
            loadUserReturns();
            loadOrders();
        }, [selectedFilter])
    );

    const loadUserReviews = async () => {
        try {
            const response = await reviewService.getUserReviews();
            const reviewedOrderIds = new Set<string>(
                response.reviews.map((review: any) => String(review.orderId))
            );
            setReviewedOrders(reviewedOrderIds);
        } catch (error) {
            console.error('Load reviews error:', error);
        }
    };

    const loadUserReturns = async () => {
        try {
            const response = await returnService.getUserReturns();
            const returnsMap: { [key: string]: any } = {};
            response.returns.forEach((returnItem: any) => {
                returnsMap[String(returnItem.orderId._id || returnItem.orderId)] = returnItem;
            });
            setOrderReturns(returnsMap);
        } catch (error) {
            console.error('Load returns error:', error);
        }
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getUserOrders();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Load orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || colors.text;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter orders based on selected status
    const filteredOrders = selectedFilter
        ? orders.filter((order: any) => order.status === selectedFilter)
        : orders;

    const renderOrderCard = ({ item }: { item: any }) => (
        <View
            style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={[styles.orderNumber, { color: colors.text }]}>
                        {item.orderNumber}
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.text + '80' }]}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </Text>
                </View>
            </View>

            {item.items && item.items.length > 0 && (
                <View style={styles.orderItemsContainer}>
                    <Text style={[styles.itemsCount, { color: colors.text }]}>
                        {item.items.length} item{item.items.length > 1 ? 's' : ''}
                    </Text>
                    {item.items.map((orderItem: any, index: number) => (
                        <View key={index} style={[styles.orderItemCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            {orderItem.thumbnail && (
                                <Image
                                    source={{ uri: orderItem.thumbnail }}
                                    style={styles.itemThumbnail}
                                />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                                    {orderItem.name}
                                </Text>
                                {orderItem.selectedOptions && Object.keys(orderItem.selectedOptions).length > 0 && (
                                    <View style={styles.specificationsContainer}>
                                        {Object.entries(orderItem.selectedOptions).map(([key, value]: [string, any]) => (
                                            <View key={key} style={[styles.specBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                                <Text style={[styles.specKey, { color: colors.primary }]}>
                                                    {key}:
                                                </Text>
                                                <Text style={[styles.specValue, { color: colors.text }]}>
                                                    {value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                <View style={styles.itemPriceRow}>
                                    <Text style={[styles.itemQuantity, { color: colors.text + '80' }]}>
                                        Qty: {orderItem.quantity}
                                    </Text>
                                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                        Rs. {orderItem.price * orderItem.quantity}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.orderFooter}>
                <Text style={[styles.totalLabel, { color: colors.text + '80' }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>
                    Rs. {item.total}
                </Text>
            </View>

            {/* Action Buttons for Delivered Orders */}
            {item.status === 'delivered' && (
                <View style={styles.actionButtonsContainer}>
                    {!reviewedOrders.has(item._id) && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                            onPress={() => router.push(`/orders/review/${item._id}`)}
                        >
                            <Ionicons name="star-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Review Products</Text>
                        </TouchableOpacity>
                    )}
                    {orderReturns[item._id] ? (
                        <View style={[
                            styles.returnStatusContainer,
                            {
                                backgroundColor: colors.surface,
                                borderColor: getStatusColor(orderReturns[item._id].status),
                                opacity: orderReturns[item._id].status === 'completed' ? 0.7 : 1
                            }
                        ]}>
                            <Ionicons name="information-circle-outline" size={18} color={getStatusColor(orderReturns[item._id].status)} />
                            <Text style={[styles.returnStatusText, { color: colors.text }]}>
                                Return: {orderReturns[item._id].status.charAt(0).toUpperCase() + orderReturns[item._id].status.slice(1)}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}
                            onPress={() => router.push(`/orders/return/${item._id}`)}
                        >
                            <Ionicons name="return-up-back-outline" size={18} color={colors.primary} />
                            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Request Return</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color={colors.text + '40'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text + '80' }]}>
                Start shopping to see your orders here
            </Text>
            <TouchableOpacity
                style={[styles.shopButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/home')}
            >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filtersContainer}>
                <FlatList
                    horizontal
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item.label}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterTab,
                                {
                                    backgroundColor: selectedFilter === item.value ? colors.primary : colors.surface,
                                    borderColor: selectedFilter === item.value ? colors.primary : colors.border,
                                }
                            ]}
                            onPress={() => setSelectedFilter(item.value)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: selectedFilter === item.value ? '#fff' : colors.text }
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderCard}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filtersContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    orderCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderItemsContainer: {
        marginBottom: 12,
    },
    itemsCount: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    orderItemCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    itemThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    specificationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 6,
        gap: 6,
    },
    specBadge: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    specKey: {
        fontSize: 11,
        fontWeight: '600',
        marginRight: 4,
    },
    specValue: {
        fontSize: 11,
        fontWeight: '500',
    },
    specText: {
        fontSize: 11,
        marginBottom: 2,
    },
    itemPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    itemQuantity: {
        fontSize: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    orderItems: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontSize: 14,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    returnStatusContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        gap: 6,
    },
    returnStatusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    shopButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
