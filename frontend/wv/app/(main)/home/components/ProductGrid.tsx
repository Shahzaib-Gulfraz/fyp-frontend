import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { productService } from '@/src/api';
import savedItemService from '@/src/api/savedItemService';

export const ProductGrid = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getProducts({ limit: 6 });
                if (response && response.products) {
                    setProducts(response.products);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSavedItems = async () => {
            try {
                const response = await savedItemService.getSavedItems();
                if (response.data?.success) {
                    const savedIds = new Set<string>(
                        response.data.data.map((item: any) =>
                            (item.product?._id || item.productId?._id || item.productId) as string
                        )
                    );
                    setSavedProductIds(savedIds);
                }
            } catch (error) {
                console.error('Failed to fetch saved items:', error);
            }
        };

        fetchProducts();
        fetchSavedItems();
    }, []);

    const handleToggleSave = async (productId: string, e: any) => {
        e.stopPropagation();

        const isSaved = savedProductIds.has(productId);

        // Optimistic update
        const newSavedIds = new Set(savedProductIds);
        if (isSaved) {
            newSavedIds.delete(productId);
        } else {
            newSavedIds.add(productId);
        }
        setSavedProductIds(newSavedIds);

        try {
            if (isSaved) {
                // Find the saved item ID to delete
                const response = await savedItemService.getSavedItems();
                const savedItem = response.data.data.find((item: any) =>
                    (item.product?._id || item.productId?._id || item.productId) === productId
                );
                if (savedItem) {
                    await savedItemService.removeSavedItem(savedItem._id);
                }
            } else {
                await savedItemService.addSavedItem(productId);
            }
        } catch (error: any) {
            // If item is already saved, just sync the state
            if (error.status === 400 && error.message?.includes('already saved')) {
                // Item is already saved in backend, update local state to match
                const newSavedIds = new Set(savedProductIds);
                newSavedIds.add(productId);
                setSavedProductIds(newSavedIds);
            } else {
                // Revert on other errors
                setSavedProductIds(savedProductIds);
                console.error('Failed to toggle save:', error);
            }
        }
    };

    const ProductCard = ({ item }: { item: any }) => {
        const isSaved = savedProductIds.has(item._id);
        const thumbImg = item.thumbnail;
        const thumbUri = typeof thumbImg === 'string' ? thumbImg : (thumbImg as any)?.url || 'https://placehold.co/400x400/png?text=No+Image';

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/buy/${item._id}`)}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: thumbUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.heartButton}
                        onPress={(e) => handleToggleSave(item._id, e)}
                    >
                        <Ionicons
                            name={isSaved ? "heart" : "heart-outline"}
                            size={20}
                            color={isSaved ? colors.error : colors.primary}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Text style={[styles.category, { color: colors.text + '80' }]}>
                        {item.category?.name || 'Product'}
                    </Text>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.row}>
                        <Text style={[styles.price, { color: colors.primary }]}>
                            Rs. {item.price}
                        </Text>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                                {item.stats?.rating || 4.0}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Featured Products</Text>
                <TouchableOpacity onPress={() => router.push('/(main)/search')}>
                    <Text style={[styles.browseButton, { color: colors.primary }]}>Browse All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.grid}>
                {products.map((product) => (
                    <ProductCard key={product._id} item={product} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    browseButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%', // Flexible width
        borderRadius: 12,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 150,
        width: '100%',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    details: {
        padding: 10,
    },
    category: {
        fontSize: 12,
        marginBottom: 2,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 4,
    }
});
