import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    FlatList,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/context/ThemeContext';
import productService from '@/src/api/productService';
import cartService from '@/src/api/cartService';
import reviewService from '@/src/api/reviewService';
import FriendSelectorModal from '@/components/social/FriendSelectorModal';
import { Modal } from 'react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState<'description' | 'reviews'>('description');
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({});
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Share State
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showFriendSelector, setShowFriendSelector] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getProduct(id as string);
                if (response && response.product) {
                    setProduct(response.product);
                    
                    // Auto-select default specifications
                    if (response.product.specifications) {
                        const initialOptions: any = {};
                        Object.entries(response.product.specifications).forEach(([key, value]: [string, any]) => {
                            if (Array.isArray(value) && value.length > 0) {
                                initialOptions[key] = value[0];
                            } else {
                                initialOptions[key] = value;
                            }
                        });
                        setSelectedOptions(initialOptions);
                    }
                    
                    loadReviews(id as string);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const loadReviews = async (productId: string) => {
        try {
            setReviewsLoading(true);
            const response = await reviewService.getProductReviews(productId);
            setReviews(response.reviews || []);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const renderImageItem = ({ item }: { item: any }) => {
        const imgUri = typeof item === 'string' ? item : (item?.url || 'https://placehold.co/600x600/png?text=No+Image');
        return (
        <View style={styles.imageSlide}>
            <Image
                source={{ uri: imgUri }}
                style={styles.productImage}
                resizeMode="cover"
            />
        </View>
    );};

    const renderPaginationDots = () => {
        const images = product?.images || [];
        if (images.length <= 1) return null;

        return (
            <View style={styles.paginationContainer}>
                {images.map((_: any, index: number) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            {
                                backgroundColor: index === currentImageIndex ? colors.primary : colors.text + '30',
                                width: index === currentImageIndex ? 24 : 8,
                            },
                        ]}
                    />
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.text + '50'} />
                <Text style={[styles.errorText, { color: colors.text }]}>Product not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const thumbUrl = typeof product.thumbnail === 'string' 
        ? product.thumbnail 
        : product.thumbnail?.url || 'https://placehold.co/600x600/png?text=No+Image';
    const images = product.images && product.images.length > 0
        ? product.images
        : [{ url: thumbUrl }];

    const specifications = product.specifications ? Object.entries(product.specifications) : [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.push('/home');
                        }
                    }}
                    style={styles.headerButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={() => setShowShareOptions(true)}>
                    <Ionicons name="share-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Share Options Modal */}
            <Modal
                visible={showShareOptions}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowShareOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowShareOptions(false)}
                >
                    <View style={[styles.shareOptionsContainer, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.shareTitle, { color: colors.text }]}>Share via</Text>

                        <View style={styles.shareRow}>
                            <TouchableOpacity
                                style={styles.shareOption}
                                onPress={() => {
                                    setShowShareOptions(false);
                                    setShowFriendSelector(true);
                                }}
                            >
                                <View style={[styles.shareIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="chatbubble-ellipses" size={24} color="#2196F3" />
                                </View>
                                <Text style={[styles.shareLabel, { color: colors.text }]}>Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.shareOption}
                                onPress={() => {
                                    setShowShareOptions(false);
                                    router.push({
                                        pathname: '/(main)/social/post/create',
                                        params: {
                                            productId: product._id,
                                            image: product.thumbnail?.url || (product.images?.[0]?.url || ''),
                                            productName: product.name
                                        }
                                    });
                                }}
                            >
                                <View style={[styles.shareIcon, { backgroundColor: '#FCE4EC' }]}>
                                    <Ionicons name="newspaper" size={24} color="#E91E63" />
                                </View>
                                <Text style={[styles.shareLabel, { color: colors.text }]}>Feed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <FriendSelectorModal
                visible={showFriendSelector}
                onClose={() => setShowFriendSelector(false)}
                onSelect={async (friendId, friendName) => {
                    setShowFriendSelector(false);
                    try {
                        const { chatService } = await import('@/src/api/chatService');
                        // Send text with deep link or special marker
                        // For V1, we send a text. In V2, we can implement structured messages.
                        const messageText = `Check out this product: ${product.name}\n/buy/${product._id}`;
                        await chatService.sendMessage(friendId, messageText);

                        if (Platform.OS === 'web') {
                            alert(`Sent to ${friendName}!`);
                        } else {
                            Alert.alert('Sent', `Product shared with ${friendName}`);
                        }
                    } catch (error) {
                        console.error('Share error:', error);
                        Alert.alert('Error', 'Failed to share product');
                    }
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View style={styles.imageGalleryContainer}>
                    <FlatList
                        data={images}
                        renderItem={renderImageItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                    />
                    {renderPaginationDots()}

                    {/* Wishlist Button */}
                    <TouchableOpacity style={[styles.wishlistButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="heart-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={[styles.infoContainer, { backgroundColor: colors.background }]}>
                    {/* Category Badge */}
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.categoryText, { color: colors.primary }]}>
                            {product.category?.name || 'Product'}
                        </Text>
                    </View>

                    {/* Product Name */}
                    <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>

                    {/* Brand */}
                    {product.brand && (
                        <Text style={[styles.brandText, { color: colors.text + '80' }]}>by {product.brand}</Text>
                    )}

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= (product.stats?.rating || 4) ? 'star' : 'star-outline'}
                                    size={16}
                                    color="#FFD700"
                                />
                            ))}
                        </View>
                        <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                            {product.stats?.rating || 4.0} ({product.stats?.reviewsCount || 0} reviews)
                        </Text>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: colors.primary }]}>Rs. {product.price}</Text>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <View style={styles.discountContainer}>
                                <Text style={[styles.comparePrice, { color: colors.text + '60' }]}>
                                    Rs. {product.compareAtPrice}
                                </Text>
                                <View style={[styles.discountBadge, { backgroundColor: colors.error + '20' }]}>
                                    <Text style={[styles.discountText, { color: colors.error }]}>
                                        {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Stock Status */}
                    <View style={styles.stockContainer}>
                        <Ionicons
                            name={product.stockQuantity > 0 ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={product.stockQuantity > 0 ? '#4CAF50' : colors.error}
                        />
                        <Text style={[styles.stockText, { color: product.stockQuantity > 0 ? '#4CAF50' : colors.error }]}>
                            {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
                        </Text>
                    </View>

                    {/* SKU */}
                    {product.sku && (
                        <View style={styles.skuContainer}>
                            <Text style={[styles.skuLabel, { color: colors.text + '60' }]}>SKU: </Text>
                            <Text style={[styles.skuValue, { color: colors.text }]}>{product.sku}</Text>
                        </View>
                    )}

                    {/* Quantity Selector */}
                    <View style={styles.quantityContainer}>
                        <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={[styles.quantityButton, { borderColor: colors.border }]}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Ionicons name="remove" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.quantityValue, { color: colors.text }]}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.quantityButton, { borderColor: colors.border }]}
                                onPress={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                            >
                                <Ionicons name="add" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Selectable Specifications */}
                    {specifications.length > 0 && (
                        <View style={styles.specificationsContainer}>
                            {specifications.map(([key, value]: [string, any], index: number) => {
                                const isArray = Array.isArray(value);
                                const options = isArray ? value : [value];

                                return (
                                    <View key={index} style={styles.specSection}>
                                        <Text style={[styles.specLabel, { color: colors.text }]}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </Text>
                                        <View style={styles.specOptions}>
                                            {options.map((option: any, optIndex: number) => {
                                                const isSelected = selectedOptions[key] === option;
                                                return (
                                                    <TouchableOpacity
                                                        key={optIndex}
                                                        onPress={() => {
                                                            setSelectedOptions(prev => ({
                                                                ...prev,
                                                                [key]: option
                                                            }));
                                                        }}
                                                        style={[
                                                            styles.specOption,
                                                            {
                                                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                                                borderColor: isSelected ? colors.primary : colors.border,
                                                            }
                                                        ]}
                                                    >
                                                        <Text style={[
                                                            styles.specOptionText,
                                                            { color: isSelected ? '#fff' : colors.text }
                                                        ]}>
                                                            {option}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Try-On Button */}
                    {product.tryon && (
                        <TouchableOpacity
                            style={[styles.tryOnButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                router.push({
                                    pathname: '/(main)/try-on',
                                    params: { product: JSON.stringify(product) }
                                });
                            }}
                        >
                            <Ionicons name="camera-outline" size={24} color="#fff" />
                            <Text style={styles.tryOnText}>Try On with AR</Text>
                        </TouchableOpacity>
                    )}

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'description' && { borderBottomColor: colors.primary }]}
                            onPress={() => setSelectedTab('description')}
                        >
                            <Text style={[styles.tabText, { color: selectedTab === 'description' ? colors.primary : colors.text + '80' }]}>
                                Description
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'reviews' && { borderBottomColor: colors.primary }]}
                            onPress={() => setSelectedTab('reviews')}
                        >
                            <Text style={[styles.tabText, { color: selectedTab === 'reviews' ? colors.primary : colors.text + '80' }]}>
                                Reviews ({reviews.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    {selectedTab === 'description' ? (
                        <View style={styles.tabContent}>
                            <Text style={[styles.description, { color: colors.text }]}>
                                {product.description || 'No description available.'}
                            </Text>

                            {/* Care Instructions */}
                            {product.careInstructions && (
                                <View style={styles.careSection}>
                                    <Text style={[styles.careTitle, { color: colors.text }]}>Care Instructions</Text>
                                    <Text style={[styles.careText, { color: colors.text + '80' }]}>
                                        {product.careInstructions}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.tabContent}>
                            {reviewsLoading ? (
                                <View style={styles.reviewsLoading}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            ) : reviews.length === 0 ? (
                                <View style={styles.noReviews}>
                                    <Ionicons name="star-outline" size={48} color={colors.text + '40'} />
                                    <Text style={[styles.noReviewsText, { color: colors.text + '80' }]}>
                                        No reviews yet
                                    </Text>
                                    <Text style={[styles.noReviewsSubtext, { color: colors.text + '60' }]}>
                                        Be the first to review this product
                                    </Text>
                                </View>
                            ) : (
                                reviews.map((review: any) => (
                                    <View key={review._id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <View style={styles.reviewHeader}>
                                            <View style={styles.reviewUserInfo}>
                                                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                                                    <Text style={styles.avatarText}>
                                                        {review.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={[styles.reviewUserName, { color: colors.text }]}>
                                                        {review.userId?.fullName || 'Anonymous'}
                                                    </Text>
                                                    <Text style={[styles.reviewDate, { color: colors.text + '60' }]}>
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.reviewRating}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name={star <= review.rating ? 'star' : 'star-outline'}
                                                        size={14}
                                                        color="#FFD700"
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        {review.comment && (
                                            <Text style={[styles.reviewComment, { color: colors.text }]}>
                                                {review.comment}
                                            </Text>
                                        )}
                                        {review.isVerifiedPurchase && (
                                            <View style={styles.verifiedBadge}>
                                                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                                                <Text style={styles.verifiedText}>Verified Purchase</Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {/* Shop Info */}
                    {product.shopId && (
                        <TouchableOpacity
                            style={[styles.shopContainer, { backgroundColor: colors.surface }]}
                            onPress={() => router.push(`/(main)/shop/${product.shopId._id}`)}
                        >
                            <View style={styles.shopInfo}>
                                <Ionicons name="storefront-outline" size={24} color={colors.primary} />
                                <View style={styles.shopDetails}>
                                    <Text style={[styles.shopLabel, { color: colors.text + '80' }]}>Sold by</Text>
                                    <Text style={[styles.shopName, { color: colors.text }]}>
                                        {product.shopId.shopName || 'Shop'}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={colors.text + '60'} />
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <LinearGradient
                colors={[colors.background + '00', colors.background]}
                style={styles.bottomGradient}
            >
                <View style={[styles.bottomBar, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                        onPress={async () => {
                            try {
                                setAddingToCart(true);

                                // Validate stock
                                if (!product.stockQuantity || product.stockQuantity < 1) {
                                    if (Platform.OS === 'web') {
                                        alert('Product is out of stock');
                                    } else {
                                        Alert.alert('Out of Stock', 'This product is currently unavailable.');
                                    }
                                    return;
                                }

                                // Add to cart
                                await cartService.addToCart(product._id, quantity, selectedOptions);

                                if (Platform.OS === 'web') {
                                    alert('Added to cart successfully!');
                                } else {
                                    Alert.alert('Success', 'Product added to cart!');
                                }
                            } catch (error: any) {
                                console.error('Add to cart error:', error);
                                const errorMsg = error.response?.data?.message || 'Failed to add to cart';
                                if (Platform.OS === 'web') {
                                    alert(errorMsg);
                                } else {
                                    Alert.alert('Error', errorMsg);
                                }
                            } finally {
                                setAddingToCart(false);
                            }
                        }}
                        disabled={addingToCart}
                    >
                        <Ionicons name="cart-outline" size={24} color={colors.primary} />
                        <Text style={[styles.addToCartText, { color: colors.primary }]}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
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
    errorText: {
        fontSize: 16,
        marginTop: 16,
    },
    backButton: {
        marginTop: 16,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 2,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageGalleryContainer: {
        height: 400,
        position: 'relative',
    },
    imageSlide: {
        width: width,
        height: 400,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    wishlistButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    infoContainer: {
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    brandText: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        marginRight: 12,
    },
    discountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    comparePrice: {
        fontSize: 16,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    skuContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    skuLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    skuValue: {
        fontSize: 13,
        fontFamily: 'monospace',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tabContent: {
        paddingVertical: 16,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    careSection: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    careTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    careText: {
        fontSize: 14,
        lineHeight: 22,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    specKey: {
        fontSize: 14,
        flex: 1,
    },
    specValue: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    noSpecs: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    shopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopDetails: {
        marginLeft: 12,
    },
    shopLabel: {
        fontSize: 12,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 20,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        elevation: 8,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginLeft: 8,
    },
    buyNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareOptionsContainer: {
        width: '80%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 5,
    },
    shareTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    shareRow: {
        flexDirection: 'row',
        gap: 32,
    },
    shareOption: {
        alignItems: 'center',
        gap: 8,
    },
    shareIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
    },
    reviewUserName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
    },
    specificationsContainer: {
        marginTop: 20,
        marginBottom: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    specSection: {
        marginBottom: 20,
    },
    specLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    specOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    specOption: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 2,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    specOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tryOnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    tryOnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    quantityContainer: {
        marginBottom: 20,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: '700',
        minWidth: 40,
        textAlign: 'center',
    },
    reviewsLoading: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noReviews: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noReviewsText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    noReviewsSubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    verifiedText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
});
