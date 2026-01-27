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
    Modal,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '@/src/api';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function ProductManagement() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const fetchProducts = async () => {
        try {
            const params: any = {};
            if (statusFilter === 'active') params.isActive = 'true';
            if (statusFilter === 'blocked') params.isActive = 'false';
            if (searchQuery) params.search = searchQuery;

            const data = await adminService.getProducts(params);
            setProducts(data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load products'
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [statusFilter, searchQuery]);

    const handleUpdateStatus = async (productId: string, isActive: boolean) => {
        try {
            await adminService.updateProductStatus(productId, { isActive });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Product ${isActive ? 'activated' : 'blocked'} successfully`
            });
            fetchProducts();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to update product status'
            });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await adminService.deleteProduct(productId);
            if (modalVisible && selectedProduct?._id === productId) {
                setModalVisible(false);
                setSelectedProduct(null);
            }
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product deleted successfully'
            });
            fetchProducts();
        } catch (error: any) {
             Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete product'
            });
        }
    };

    const confirmStatusChange = (product: any) => {
        const action = product.isActive ? 'block' : 'unblock';
        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Listing`,
            `Are you sure you want to ${action} "${product.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action.toUpperCase(),
                    style: product.isActive ? 'destructive' : 'default',
                    onPress: () => handleUpdateStatus(product._id, !product.isActive)
                }
            ]
        );
    };

    const confirmDelete = (product: any) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'DELETE',
                    style: 'destructive',
                    onPress: () => handleDeleteProduct(product._id)
                }
            ]
        );
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={styles.productCard}>
            <Image
                source={item.thumbnail?.url || 'https://placehold.co/100'}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <View style={styles.infoTop}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.isActive ? '#2E7D32' : '#C62828' }
                        ]}>
                            {item.isActive ? 'Active' : 'Blocked'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.shopName} numberOfLines={1}>
                    <Ionicons name="storefront-outline" /> {item.shopId?.shopName}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.price}</Text>
                    <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            item.isActive ? styles.blockButton : styles.unblockButton
                        ]}
                        onPress={() => confirmStatusChange(item)}
                    >
                        <Ionicons
                            name={item.isActive ? "ban-outline" : "checkmark-circle-outline"}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>
                            {item.isActive ? 'Block' : 'Unblock'}
                        </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.iconActions}>
                        <TouchableOpacity
                            style={[styles.iconButton, styles.eyeButton]}
                            onPress={() => {
                                setSelectedProduct(item);
                                setModalVisible(true);
                            }}
                        >
                            <Ionicons name="eye-outline" size={20} color="#000" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.iconButton, styles.deleteButton]}
                            onPress={() => confirmDelete(item)}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderProductDetails = () => {
        if (!selectedProduct) return null;
        
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Product Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalScroll}>
                            <Image
                                source={selectedProduct.thumbnail?.url || 'https://placehold.co/400'}
                                style={styles.modalImage}
                            />
                            
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                                
                                <View style={styles.modalStatusRow}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: selectedProduct.isActive ? '#E8F5E9' : '#FFEBEE' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: selectedProduct.isActive ? '#2E7D32' : '#C62828', fontSize: 12 }
                                        ]}>
                                            {selectedProduct.isActive ? 'Active' : 'Blocked'}
                                        </Text>
                                    </View>
                                    <Text style={styles.modalPrice}>${selectedProduct.price}</Text>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="storefront-outline" size={18} color="#666" />
                                        <Text style={styles.detailLabel}>Shop:</Text>
                                        <Text style={styles.detailValue}>{selectedProduct.shopId?.shopName || 'N/A'}</Text>
                                    </View>
                                    
                                    <View style={styles.detailRow}>
                                        <Ionicons name="pricetag-outline" size={18} color="#666" />
                                        <Text style={styles.detailLabel}>Category:</Text>
                                        <Text style={styles.detailValue}>{selectedProduct.category}</Text>
                                    </View>
                                    
                                    <View style={styles.detailRow}>
                                        <Ionicons name="layers-outline" size={18} color="#666" />
                                        <Text style={styles.detailLabel}>Stock:</Text>
                                        <Text style={styles.detailValue}>{selectedProduct.stock || 0} units</Text>
                                    </View>
                                    
                                    {selectedProduct.brand && (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="ribbon-outline" size={18} color="#666" />
                                            <Text style={styles.detailLabel}>Brand:</Text>
                                            <Text style={styles.detailValue}>{selectedProduct.brand}</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.descriptionLabel}>Description</Text>
                                <Text style={styles.descriptionText}>
                                    {selectedProduct.description || 'No description available.'}
                                </Text>
                            </View>
                        </ScrollView>
                        
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.deleteButtonOutline]}
                                onPress={() => confirmDelete(selectedProduct)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                            
                             <TouchableOpacity
                                style={[
                                    styles.modalButton, 
                                    selectedProduct.isActive ? styles.blockButton : styles.unblockButton
                                ]}
                                onPress={() => confirmStatusChange(selectedProduct)}
                            >
                                <Text style={styles.actionButtonText}>
                                    {selectedProduct.isActive ? 'Block Product' : 'Unblock Product'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Listing Management</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                {(['all', 'active', 'blocked'] as const).map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.filterTab, statusFilter === s && styles.activeFilterTab]}
                        onPress={() => setStatusFilter(s)}
                    >
                        <Text style={[styles.filterTabText, statusFilter === s && styles.activeFilterTabText]}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && !isRefreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                            setIsRefreshing(true);
                            fetchProducts();
                        }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shirt-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                />
            )}
            
            {renderProductDetails()}
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
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilterTab: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeFilterTabText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    productImage: {
        width: 100,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    infoTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    productName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    shopName: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    category: {
        fontSize: 12,
        color: '#888',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
        maxWidth: 100,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        marginRight: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    blockButton: {
        backgroundColor: '#FF3B30',
    },
    unblockButton: {
        backgroundColor: '#4CAF50',
    },
    iconActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeButton: {
        backgroundColor: '#E3F2FD',
    },
    deleteButton: {
        backgroundColor: '#FFEBEE',
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalScroll: {
        padding: 0,
    },
    modalImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#F0F0F0',
    },
    modalInfo: {
        padding: 20,
    },
    modalProductName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    modalStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    detailSection: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        width: 80,
        marginLeft: 10,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#666',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonOutline: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF3B30',
        gap: 8,
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontWeight: '600',
    }
});
