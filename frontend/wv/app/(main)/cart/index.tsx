import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import cartService from '@/src/api/cartService';

export default function CartScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.getCart();
            setCart(response.cart);
        } catch (error: any) {
            console.error('Load cart error:', error);
            if (error.response?.status === 401) {
                // User not logged in
                if (Platform.OS === 'web') {
                    alert('Please login to view cart');
                } else {
                    Alert.alert('Login Required', 'Please login to view your cart');
                }
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCart();
        setRefreshing(false);
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        try {
            if (newQuantity < 1) return;

            const response = await cartService.updateCartItem(itemId, newQuantity, undefined);
            setCart(response.cart);
        } catch (error: any) {
            console.error('Update quantity error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update quantity';
            if (Platform.OS === 'web') {
                alert(errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const response = await cartService.removeFromCart(itemId);
            setCart(response.cart);

            if (Platform.OS === 'web') {
                alert('Item removed from cart');
            } else {
                Alert.alert('Success', 'Item removed from cart');
            }
        } catch (error: any) {
            console.error('Remove item error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to remove item';
            if (Platform.OS === 'web') {
                alert(errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading cart...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isEmpty = !cart?.items || cart.items.length === 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                <View style={{ width: 40 }} />
            </View>

            {isEmpty ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={100} color={colors.text + '40'} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.text + '80' }]}>
                        Add some products to get started
                    </Text>
                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/home')}
                    >
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.scrollView}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                        }
                    >
                        {cart.items.map((item: any) => {
                            const itemThumb = item.productId.thumbnail;
                            const itemThumbUri = typeof itemThumb === 'string' ? itemThumb : (itemThumb as any)?.url || 'https://placehold.co/100x100/png?text=No+Image';
                            return (
                            <View key={item._id} style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TouchableOpacity
                                    onPress={() => router.push(`/buy/${item.productId._id}`)}
                                    style={styles.itemContent}
                                >
                                    <Image
                                        source={{ uri: itemThumbUri }}
                                        style={styles.itemImage}
                                    />
                                    <View style={styles.itemDetails}>
                                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                                            {item.productId.name}
                                        </Text>

                                        {/* Selected Options */}
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <View style={styles.optionsContainer}>
                                                {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                                                    <Text key={key} style={[styles.optionText, { color: colors.text + '80' }]}>
                                                        {key}: {value}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}

                                        <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                            Rs. {item.price}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Quantity Controls */}
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { borderColor: colors.border }]}
                                        onPress={() => updateQuantity(item._id, item.quantity - 1)}
                                    >
                                        <Ionicons name="remove" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { borderColor: colors.border }]}
                                        onPress={() => updateQuantity(item._id, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                {/* Remove Button */}
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeItem(item._id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                                </TouchableOpacity>

                                {/* Subtotal */}
                                <Text style={[styles.subtotal, { color: colors.text }]}>
                                    Rs. {item.price * item.quantity}
                                </Text>
                            </View>
                            );
                        })}

                        <View style={{ height: 120 }} />
                    </ScrollView>

                    {/* Bottom Summary */}
                    <View style={[styles.bottomSummary, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.text + '80' }]}>Total Items:</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{cart.totalItems}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                            <Text style={[styles.totalValue, { color: colors.primary }]}>Rs. {cart.totalPrice}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/checkout')}
                        >
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
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
    scrollView: {
        flex: 1,
    },
    cartItem: {
        margin: 16,
        marginBottom: 0,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    itemContent: {
        flexDirection: 'row',
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionsContainer: {
        marginVertical: 4,
    },
    optionText: {
        fontSize: 12,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    subtotal: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    bottomSummary: {
        padding: 20,
        borderTopWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
