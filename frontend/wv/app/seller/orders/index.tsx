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
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import orderService from '@/src/api/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
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

export default function ShopOrdersScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [shopId, setShopId] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0
    });
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadShopId();
    }, []);

    useEffect(() => {
        if (shopId) {
            loadOrders();
        }
    }, [shopId, selectedFilter]);

    const loadShopId = async () => {
        try {
            const shop = await AsyncStorage.getItem('shop');
            if (shop) {
                const shopData = JSON.parse(shop);
                setShopId(shopData._id);
            }
        } catch (error) {
            console.error('Load shop ID error:', error);
        }
    };

    const loadOrders = async () => {
        if (!shopId) return;

        try {
            setLoading(true);
            const response = await orderService.getShopOrders(shopId, {
                status: selectedFilter,
                limit: 50
            });

            setOrders(response.orders || []);
            calculateStats(response.orders || []);

            // Initialize selected status for each order
            const statusMap: { [key: string]: string } = {};
            (response.orders || []).forEach((order: any) => {
                statusMap[order._id] = order.status;
            });
            setSelectedStatus(statusMap);
        } catch (error) {
            console.error('Load orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersList: any[]) => {
        const stats = {
            total: ordersList.length,
            pending: ordersList.filter(o => o.status === 'pending').length,
            processing: ordersList.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
            completed: ordersList.filter(o => o.status === 'delivered').length
        };
        setStats(stats);
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
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            setSelectedStatus({ ...selectedStatus, [orderId]: newStatus });
            Alert.alert('Success', 'Order status updated successfully');
            loadOrders(); // Refresh orders
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const renderStatsCard = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#9C27B0' }]}>{stats.processing}</Text>
                <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Processing</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.completed}</Text>
                <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Completed</Text>
            </View>
        </View>
    );

    const renderOrderCard = ({ item }: { item: any }) => {
        const isExpanded = expandedOrderId === item._id;

        return (
            <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Order Header - Always Visible */}
                <TouchableOpacity onPress={() => toggleOrderExpand(item._id)}>
                    <View style={styles.orderHeader}>
                        <View style={styles.orderInfo}>
                            <Text style={[styles.orderNumber, { color: colors.text }]}>
                                {item.orderNumber}
                            </Text>
                            <Text style={[styles.orderDate, { color: colors.text + '80' }]}>
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                </Text>
                            </View>
                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.text}
                            />
                        </View>
                    </View>

                    <View style={styles.customerInfo}>
                        <Ionicons name="person-outline" size={16} color={colors.text + '80'} />
                        <Text style={[styles.customerName, { color: colors.text }]}>
                            {item.userId?.fullName || 'Customer'}
                        </Text>
                    </View>

                    <View style={styles.orderSummary}>
                        <Text style={[styles.itemsCountText, { color: colors.text + '80' }]}>
                            {item.items?.length || 0} items
                        </Text>
                        <Text style={[styles.totalAmount, { color: colors.primary }]}>
                            Rs. {item.total}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Order Items */}
                        <View style={styles.itemsSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
                            {item.items?.map((orderItem: any, index: number) => (
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

                        {/* Shipping Address */}
                        {item.shippingAddress && (
                            <View style={styles.addressSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                                <View style={[styles.addressCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                                    <View style={{ flex: 1 }}>
                                        {item.shippingAddress.fullName && (
                                            <Text style={[styles.addressText, { color: colors.text, fontWeight: '600' }]}>
                                                {item.shippingAddress.fullName}
                                            </Text>
                                        )}
                                        {item.shippingAddress.phone && (
                                            <Text style={[styles.addressText, { color: colors.text + '80' }]}>
                                                📞 {item.shippingAddress.phone}
                                            </Text>
                                        )}
                                        {item.shippingAddress.address && (
                                            <Text style={[styles.addressText, { color: colors.text }]}>
                                                {item.shippingAddress.address}
                                            </Text>
                                        )}
                                        {item.shippingAddress.city && (
                                            <Text style={[styles.addressText, { color: colors.text + '80' }]}>
                                                {item.shippingAddress.city}{item.shippingAddress.postalCode ? `, ${item.shippingAddress.postalCode}` : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Status Update Section - Only show if not delivered or cancelled */}
                        {item.status !== 'delivered' && item.status !== 'cancelled' && (
                            <View style={styles.statusSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Status</Text>
                                <View style={styles.statusButtonsGrid}>
                                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusSelectButton,
                                                {
                                                    backgroundColor: selectedStatus[item._id] === status
                                                        ? getStatusColor(status)
                                                        : colors.background,
                                                    borderColor: getStatusColor(status),
                                                }
                                            ]}
                                            onPress={() => handleStatusChange(item._id, status)}
                                        >
                                            <Text style={[
                                                styles.statusSelectText,
                                                {
                                                    color: selectedStatus[item._id] === status
                                                        ? '#fff'
                                                        : getStatusColor(status)
                                                }
                                            ]}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color={colors.text + '40'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text + '80' }]}>
                Orders will appear here when customers place them
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Order Management</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Stats Cards */}
            {renderStatsCard()}

            {/* Filter Tabs */}
            <View style={styles.filtersContainer}>
                <FlatList
                    horizontal
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item.value}
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
                    data={orders}
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
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
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
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    customerName: {
        fontSize: 14,
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
    orderSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    itemsCountText: {
        fontSize: 13,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    itemsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    addressSection: {
        marginBottom: 16,
    },
    addressCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
    },
    addressText: {
        fontSize: 13,
        lineHeight: 18,
    },
    statusSection: {
        marginBottom: 8,
    },
    statusButtonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusSelectButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        minWidth: '30%',
        alignItems: 'center',
    },
    statusSelectText: {
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
    },
});
