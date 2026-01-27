import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    ScrollView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '@/src/api';
import { Image } from 'expo-image';
import ShopDetailsModal from './components/ShopDetailsModal';

export default function ShopManagement() {
    const router = useRouter();
    const [shops, setShops] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'inactive'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedShop, setSelectedShop] = useState<any | null>(null);

    const fetchShops = async () => {
        try {
            const params: any = {};
            if (filter !== 'all') params.status = filter;
            if (searchQuery) params.search = searchQuery;

            const data = await adminService.getShops(params);
            setShops(data.shops);
        } catch (error) {
            console.error('Error fetching shops:', error);
            Alert.alert('Error', 'Failed to load shops');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [filter, searchQuery]);

    const handleUpdateStatus = async (shopId: string, statusData: any) => {
        try {
            console.log('F-DEBUG: Updating shop status', { shopId, statusData });
            await adminService.updateShopStatus(shopId, statusData);
            console.log('F-DEBUG: Update successful');
            fetchShops();
        } catch (error: any) {
            console.error('F-DEBUG: Update error', error);
            Alert.alert('Error', error.message || 'Failed to update shop status');
        }
    };

    const confirmStatusChange = (shop: any, type: 'approve' | 'block' | 'unblock' | 'reject') => {
        let title = '';
        let message = '';
        let statusData: any = {};

        switch (type) {
            case 'approve':
                title = 'Approve Shop';
                message = `Are you sure you want to approve ${shop.shopName}?`;
                statusData = { isVerified: true };
                break;
            case 'block':
                title = 'Block Shop';
                message = `Are you sure you want to block ${shop.shopName}? This shop and its products will no longer be visible.`;
                statusData = { isActive: false };
                break;
            case 'unblock':
                title = 'Unblock Shop';
                message = `Do you want to unblock ${shop.shopName}?`;
                statusData = { isActive: true };
                break;
            case 'reject':
                title = 'Reject Shop';
                message = `Are you sure you want to reject ${shop.shopName}?`;
                statusData = { isVerified: false }; // In a real app, you might want to delete or mark as rejected
                break;
        }

        console.log('F-DEBUG: confirmStatusChange triggered', { type, shopId: shop._id, platform: Platform.OS });

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed) {
                console.log('F-DEBUG: Web confirm accepted');
                handleUpdateStatus(shop._id, statusData);
            }
            return;
        }

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel', onPress: () => console.log('F-DEBUG: Cancel pressed') },
            {
                text: type === 'block' ? 'Block' : 'Confirm',
                style: type === 'block' ? 'destructive' : 'default',
                onPress: () => {
                    console.log('F-DEBUG: Confirm pressed');
                    handleUpdateStatus(shop._id, statusData);
                }
            }
        ], { cancelable: true });
    };

    const renderShopItem = ({ item }: { item: any }) => (
        <View style={styles.shopCard}>
            <View style={styles.shopHeader}>
                <Image
                    source={item.logo?.url || 'https://placehold.co/50'}
                    style={styles.shopLogo}
                />
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{item.shopName}</Text>
                    <Text style={styles.shopCategory}>{item.category} • {item.city}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.isVerified ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.isVerified ? '#2E7D32' : '#EF6C00' }
                    ]}>
                        {item.isVerified ? 'Verified' : 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.shopDetails}>
                <Text style={styles.detailText}><Ionicons name="mail-outline" /> {item.email}</Text>
                <Text style={styles.detailText}><Ionicons name="call-outline" /> {item.phone}</Text>
            </View>

            <View style={styles.cardActions}>
                {!item.isVerified ? (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => confirmStatusChange(item, 'approve')}
                    >
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                ) : (
                    item.isActive ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.blockButton]}
                            onPress={() => confirmStatusChange(item, 'block')}
                        >
                            <Text style={styles.actionButtonText}>Block</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.unblockButton]}
                            onPress={() => confirmStatusChange(item, 'unblock')}
                        >
                            <Text style={styles.actionButtonText}>Unblock</Text>
                        </TouchableOpacity>
                    )
                )}
                <TouchableOpacity
                    style={[styles.actionButton, styles.detailsButton]}
                    onPress={() => {
                        console.log('Opening details for:', item.shopName);
                        setSelectedShop(item);
                        setDetailsModalVisible(true);
                    }}
                >
                    <Ionicons name="eye-outline" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Shop Management</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search shops..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(['all', 'pending', 'verified', 'inactive'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.activeFilterChip]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterChipText, filter === f && styles.activeFilterChipText]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading && !isRefreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={shops}
                    renderItem={renderShopItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                            setIsRefreshing(true);
                            fetchShops();
                        }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="storefront-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No shops found</Text>
                        </View>
                    }
                />
            )}
            
            {selectedShop && (
                <ShopDetailsModal 
                    visible={detailsModalVisible}
                    onDismiss={() => {
                        console.log('Dismissing modal');
                        setDetailsModalVisible(false);
                    }}
                    shop={selectedShop}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterContainer: {
        paddingVertical: 15,
        paddingLeft: 20,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilterChip: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    filterChipText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterChipText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    shopCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopLogo: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
    },
    shopInfo: {
        flex: 1,
        marginLeft: 15,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    shopCategory: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    shopDetails: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    blockButton: {
        backgroundColor: '#FF3B30',
    },
    unblockButton: {
        backgroundColor: '#2196F3',
    },
    detailsButton: {
        width: 40,
        backgroundColor: '#F0F0F0',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    },
});
