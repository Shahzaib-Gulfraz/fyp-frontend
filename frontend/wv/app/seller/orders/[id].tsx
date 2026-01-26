import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import orderService from '@/src/api/orderService';

const STATUS_COLORS = {
    pending: '#FFA500',
    confirmed: '#2196F3',
    processing: '#9C27B0',
    shipped: '#FF9800',
    delivered: '#4CAF50',
    cancelled: '#F44336',
};

export default function OrderDetailScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrder(id as string);
            setOrder(response.order);
        } catch (error) {
            console.error('Load order error:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = () => {
        const statusOptions = [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Processing', value: 'processing' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Cancelled', value: 'cancelled' },
        ];

        const buttons = statusOptions
            .filter(opt => opt.value !== order.status)
            .map(opt => ({
                text: opt.label,
                onPress: () => updateOrderStatus(opt.value)
            }));

        buttons.push({ text: 'Cancel', onPress: () => { }, style: 'cancel' } as any);

        Alert.alert(
            'Update Order Status',
            `Current status: ${order.status}\nOrder: ${order.orderNumber}`,
            buttons
        );
    };

    const updateOrderStatus = async (newStatus: string) => {
        try {
            await orderService.updateOrderStatus(order._id, newStatus);
            Alert.alert('Success', 'Order status updated successfully');
            loadOrderDetails(); // Refresh order
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || colors.text;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={80} color={colors.text + '40'} />
                    <Text style={[styles.errorText, { color: colors.text }]}>Order not found</Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Header */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.orderHeaderRow}>
                        <View>
                            <Text style={[styles.orderNumber, { color: colors.text }]}>{order.orderNumber}</Text>
                            <Text style={[styles.orderDate, { color: colors.text + '80' }]}>
                                {formatDate(order.createdAt)}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Customer Information */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={colors.text + '80'} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {order.userId?.fullName || 'N/A'}
                        </Text>
                    </View>
                    {order.userId?.email && (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={20} color={colors.text + '80'} />
                            <Text style={[styles.infoText, { color: colors.text }]}>{order.userId.email}</Text>
                        </View>
                    )}
                    {order.userId?.phone && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={20} color={colors.text + '80'} />
                            <Text style={[styles.infoText, { color: colors.text }]}>{order.userId.phone}</Text>
                        </View>
                    )}
                </View>

                {/* Shipping Address */}
                {order.shippingAddress && (
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={colors.text + '80'} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    {order.shippingAddress.street}
                                </Text>
                                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </Text>
                                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                                    {order.shippingAddress.country}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Order Items */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Order Items ({order.items?.length || 0})
                    </Text>
                    {order.items?.map((item: any, index: number) => (
                        <View key={index} style={[styles.itemCard, { borderColor: colors.border }]}>
                            {item.thumbnail && (
                                <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <View style={styles.variationsContainer}>
                                        {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                                            <View key={key} style={[styles.variationBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                                <Text style={[styles.variationKey, { color: colors.primary }]}>{key}:</Text>
                                                <Text style={[styles.variationValue, { color: colors.text }]}>{value}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                <View style={styles.itemPriceRow}>
                                    <Text style={[styles.itemQuantity, { color: colors.text + '80' }]}>
                                        Qty: {item.quantity}
                                    </Text>
                                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                        Rs. {item.price * item.quantity}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text + '80' }]}>Subtotal</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>Rs. {order.subtotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text + '80' }]}>Shipping Fee</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>Rs. {order.shippingFee}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>Rs. {order.total}</Text>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Information</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text + '80' }]}>Payment Method</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {order.paymentMethod?.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text + '80' }]}>Payment Status</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Update Status Button */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.updateButton, { backgroundColor: colors.primary }]}
                    onPress={handleUpdateStatus}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.updateButtonText}>Update Order Status</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    orderHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        flex: 1,
    },
    itemCard: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 12,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    variationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    variationBadge: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    variationKey: {
        fontSize: 11,
        fontWeight: '600',
        marginRight: 4,
    },
    variationValue: {
        fontSize: 11,
    },
    itemPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
