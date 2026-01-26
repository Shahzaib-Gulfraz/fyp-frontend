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
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/src/context/ThemeContext';
import returnService from '@/src/api/returnService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Completed', value: 'completed' },
];

const STATUS_COLORS = {
    pending: '#FFA500',
    approved: '#2196F3',
    rejected: '#F44336',
    completed: '#4CAF50',
};

export default function ShopReturnsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [shopId, setShopId] = useState<string | null>(null);
    const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);

    useEffect(() => {
        loadShopId();
    }, []);

    useEffect(() => {
        if (shopId) {
            loadReturns();
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

    const loadReturns = async () => {
        if (!shopId) return;

        try {
            setLoading(true);
            const response = await returnService.getShopReturns(shopId, selectedFilter);
            setReturns(response.returns || []);
        } catch (error) {
            console.error('Load returns error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadReturns();
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

    const toggleExpand = (returnId: string) => {
        setExpandedReturnId(expandedReturnId === returnId ? null : returnId);
    };

    const handleStatusUpdate = async (returnId: string, newStatus: string, notes: string = '') => {
        try {
            await returnService.updateReturnStatus(returnId, newStatus, notes);
            Alert.alert('Success', `Return request ${newStatus} successfully`);
            loadReturns();
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update return status');
        }
    };

    const showStatusUpdateDialog = (returnItem: any) => {
        Alert.alert(
            'Update Return Status',
            `Order: ${returnItem.orderId?.orderNumber}\nCustomer: ${returnItem.userId?.fullName}`,
            [
                {
                    text: 'Approve',
                    onPress: () => handleStatusUpdate(returnItem._id, 'approved', 'Return request approved by shop owner')
                },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => handleStatusUpdate(returnItem._id, 'rejected', 'Return request rejected by shop owner')
                },
                {
                    text: 'Mark Completed',
                    onPress: () => handleStatusUpdate(returnItem._id, 'completed', 'Return completed and refund processed')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const renderReturnCard = ({ item }: { item: any }) => {
        const isExpanded = expandedReturnId === item._id;

        return (
            <View style={[styles.returnCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => toggleExpand(item._id)}>
                    <View style={styles.returnHeader}>
                        <View style={styles.returnInfo}>
                            <Text style={[styles.orderNumber, { color: colors.text }]}>
                                {item.orderId?.orderNumber || 'N/A'}
                            </Text>
                            <Text style={[styles.returnDate, { color: colors.text + '80' }]}>
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

                    <View style={styles.returnSummary}>
                        <Text style={[styles.itemsCountText, { color: colors.text + '80' }]}>
                            {item.items?.length || 0} items • Rs. {item.refundAmount}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Return Items */}
                        <View style={styles.itemsSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Return Items</Text>
                            {item.items?.map((returnItem: any, index: number) => (
                                <View key={index} style={[styles.itemCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    {returnItem.thumbnail && (
                                        <Image source={{ uri: typeof returnItem.thumbnail === 'string' ? returnItem.thumbnail : returnItem.thumbnail?.url || 'https://via.placeholder.com/60' }} style={styles.itemThumbnail} />
                                    )}
                                    <View style={styles.itemDetails}>
                                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                                            {returnItem.name}
                                        </Text>
                                        <Text style={[styles.itemPrice, { color: colors.text + '80' }]}>
                                            Qty: {returnItem.quantity} • Rs. {returnItem.price * returnItem.quantity}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Return Reason */}
                        <View style={styles.reasonSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Return Reason</Text>
                            <View style={[styles.reasonCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <Text style={[styles.reasonLabel, { color: colors.text + '80' }]}>
                                    {item.reason?.replace('_', ' ').toUpperCase()}
                                </Text>
                                {item.detailedReason && (
                                    <Text style={[styles.reasonText, { color: colors.text }]}>
                                        {item.detailedReason}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Customer Contact */}
                        {item.userId && (
                            <View style={styles.contactSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Contact</Text>
                                <View style={[styles.contactCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    {item.userId.email && (
                                        <View style={styles.contactRow}>
                                            <Ionicons name="mail-outline" size={16} color={colors.primary} />
                                            <Text style={[styles.contactText, { color: colors.text }]}>
                                                {item.userId.email}
                                            </Text>
                                        </View>
                                    )}
                                    {item.userId.phone && (
                                        <View style={styles.contactRow}>
                                            <Ionicons name="call-outline" size={16} color={colors.primary} />
                                            <Text style={[styles.contactText, { color: colors.text }]}>
                                                {item.userId.phone}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        {item.status === 'pending' && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                                    onPress={() => handleStatusUpdate(item._id, 'approved', 'Return approved')}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.actionBtnText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#F44336' }]}
                                    onPress={() => handleStatusUpdate(item._id, 'rejected', 'Return rejected')}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.actionBtnText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {item.status === 'approved' && (
                            <TouchableOpacity
                                style={[styles.completeBtn, { backgroundColor: colors.primary }]}
                                onPress={() => handleStatusUpdate(item._id, 'completed', 'Return completed')}
                            >
                                <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
                                <Text style={styles.actionBtnText}>Mark as Completed</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="return-down-back-outline" size={80} color={colors.text + '40'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No return requests</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text + '80' }]}>
                Return requests will appear here
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Return Requests</Text>
                <View style={{ width: 40 }} />
            </View>

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

            {/* Returns List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={returns}
                    keyExtractor={(item) => item._id}
                    renderItem={renderReturnCard}
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
    returnCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    returnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    returnInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    returnDate: {
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
    returnSummary: {
        marginTop: 8,
    },
    itemsCountText: {
        fontSize: 13,
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
    itemCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    itemThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 12,
    },
    reasonSection: {
        marginBottom: 16,
    },
    reasonCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    reasonText: {
        fontSize: 13,
        lineHeight: 18,
    },
    contactSection: {
        marginBottom: 16,
    },
    contactCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 13,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
        marginTop: 8,
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
