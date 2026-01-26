import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import orderService from '@/src/api/orderService';
import reviewService from '@/src/api/reviewService';

export default function ReviewOrderScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviews, setReviews] = useState<any>({});

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrder(orderId as string);
            setOrder(response.order);

            // Initialize reviews state
            const initialReviews: any = {};
            response.order.items.forEach((item: any) => {
                initialReviews[item.productId] = {
                    rating: 0,
                    comment: '',
                };
            });
            setReviews(initialReviews);
        } catch (error) {
            console.error('Load order error:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const setRating = (productId: string, rating: number) => {
        setReviews({
            ...reviews,
            [productId]: {
                ...reviews[productId],
                rating
            }
        });
    };

    const setComment = (productId: string, comment: string) => {
        setReviews({
            ...reviews,
            [productId]: {
                ...reviews[productId],
                comment
            }
        });
    };

    const handleSubmit = async () => {
        try {
            // Validate at least one review has rating
            const hasValidReview = Object.values(reviews).some((review: any) => review.rating > 0);
            if (!hasValidReview) {
                if (Platform.OS === 'web') {
                    alert('Please rate at least one product');
                } else {
                    Alert.alert('Error', 'Please rate at least one product');
                }
                return;
            }

            setSubmitting(true);

            // Submit reviews for products with ratings
            const promises = Object.entries(reviews).map(([productId, review]: [string, any]) => {
                if (review.rating > 0) {
                    return reviewService.createReview({
                        productId,
                        orderId,
                        rating: review.rating,
                        comment: review.comment,
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);

            if (Platform.OS === 'web') {
                alert('Thank you for your reviews!');
                router.back();
            } else {
                Alert.alert('Success', 'Thank you for your reviews!', [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]);
            }
        } catch (error: any) {
            console.error('Submit reviews error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to submit reviews';
            if (Platform.OS === 'web') {
                alert(errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (productId: string, currentRating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(productId, star)}
                    >
                        <Ionicons
                            name={star <= currentRating ? 'star' : 'star-outline'}
                            size={32}
                            color={star <= currentRating ? '#FFD700' : colors.text + '40'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
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
                    <Text style={[styles.errorText, { color: colors.text }]}>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Review Products</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.orderInfo, { color: colors.text + '80' }]}>
                    Order: {order.orderNumber}
                </Text>

                {order.items.map((item: any, index: number) => (
                    <View key={index} style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.productHeader}>
                            {item.thumbnail && (
                                <Image source={{ uri: item.thumbnail }} style={styles.productImage} />
                            )}
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <View style={styles.specsContainer}>
                                        {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                                            <Text key={key} style={[styles.specText, { color: colors.text + '80' }]}>
                                                {key}: {value}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.ratingSection}>
                            <Text style={[styles.ratingLabel, { color: colors.text }]}>Your Rating</Text>
                            {renderStars(item.productId, reviews[item.productId]?.rating || 0)}
                        </View>

                        <View style={styles.commentSection}>
                            <Text style={[styles.commentLabel, { color: colors.text }]}>Your Review (Optional)</Text>
                            <TextInput
                                style={[styles.commentInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="Share your experience with this product..."
                                placeholderTextColor={colors.text + '60'}
                                multiline
                                numberOfLines={4}
                                value={reviews[item.productId]?.comment || ''}
                                onChangeText={(text) => setComment(item.productId, text)}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Submit Reviews</Text>
                        </>
                    )}
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
    },
    errorText: {
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
    content: {
        flex: 1,
        padding: 16,
    },
    orderInfo: {
        fontSize: 14,
        marginBottom: 16,
    },
    productCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    productHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    specsContainer: {
        gap: 4,
    },
    specText: {
        fontSize: 12,
    },
    ratingSection: {
        marginBottom: 16,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    commentSection: {
        marginTop: 8,
    },
    commentLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
