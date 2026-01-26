import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ProductMentionCardProps {
    product: {
        productId: string;
        productName: string;
        productImage: string;
        productPrice: number;
    };
    theme: any;
}

/**
 * Product Mention Card Component
 * Displays a compact product card in chat messages
 */
export const ProductMentionCard: React.FC<ProductMentionCardProps> = ({ product, theme }) => {
    const router = useRouter();
    const styles = getStyles(theme.colors);

    const handlePress = () => {
        router.push(`/buy/${product.productId}`);
    };

    // Handle image URL - could be string or object
    const imageUrl = typeof product.productImage === 'string'
        ? product.productImage
        : product.productImage?.url || 'https://via.placeholder.com/100';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <Package size={24} color={theme.colors.textSecondary} />
                    </View>
                )}
            </View>

            <View style={styles.details}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.productName}
                </Text>
                <Text style={styles.price}>
                    ${product.productPrice?.toFixed(2)}
                </Text>
            </View>

            <View style={styles.badge}>
                <Text style={styles.badgeText}>View</Text>
            </View>
        </TouchableOpacity>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
        maxWidth: width * 0.75,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.background,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    details: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    badge: {
        alignSelf: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
