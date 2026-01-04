// src/components/shop/ProductCardItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Edit, Trash2, Eye, Package } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { ClothingItem } from '@/src/types';

interface ProductCardItemProps {
  product: ClothingItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  onEdit,
  onDelete,
  onPreview,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <Card style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        margin: spacing.sm,
      }
    ]}>
      <View style={styles.content}>
        {/* Product Image */}
        <Image
          source={{ uri: product.image }}
          style={[
            styles.image,
            { borderRadius: radius.md }
          ]}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={[
              styles.brand,
              { 
                color: colors.textSecondary,
                fontFamily: fonts.medium,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }
            ]}>
              {product.brand}
            </Text>
            <Text style={[
              styles.name,
              { 
                color: colors.text,
                fontFamily: fonts.semiBold,
                fontSize: 14,
                lineHeight: 18,
                marginTop: 2,
              }
            ]} 
            numberOfLines={2}
            >
              {product.name}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.categoryTag}>
              <Package size={12} color={colors.textTertiary} />
              <Text style={[
                styles.categoryText,
                { 
                  color: colors.textTertiary,
                  fontFamily: fonts.medium,
                  fontSize: 10,
                  marginLeft: 4,
                }
              ]}>
                {product.category}
              </Text>
            </View>
            
            <Text style={[
              styles.price,
              { 
                color: colors.primary,
                fontFamily: fonts.bold,
                fontSize: 16,
              }
            ]}>
              {product.price}
            </Text>
          </View>

          <View style={styles.sizesRow}>
            {product.sizes.slice(0, 3).map(size => (
              <View
                key={size}
                style={[
                  styles.sizeBadge,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: 4,
                  }
                ]}
              >
                <Text style={[
                  styles.sizeText,
                  { 
                    color: colors.text,
                    fontFamily: fonts.medium,
                    fontSize: 10,
                  }
                ]}>
                  {size}
                </Text>
              </View>
            ))}
            {product.sizes.length > 3 && (
              <Text style={[
                styles.moreSizes,
                { 
                  color: colors.textTertiary,
                  fontFamily: fonts.regular,
                  fontSize: 10,
                }
              ]}>
                +{product.sizes.length - 3} more
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onPreview}
              style={[
                styles.actionButton,
                { 
                  backgroundColor: colors.primary + '10',
                  borderRadius: radius.sm,
                }
              ]}
            >
              <Eye size={16} color={colors.primary} />
              <Text style={[
                styles.actionText,
                { 
                  color: colors.primary,
                  fontFamily: fonts.medium,
                  fontSize: 12,
                  marginLeft: 4,
                }
              ]}>
                Preview
              </Text>
            </TouchableOpacity>

            <View style={styles.editDeleteButtons}>
              <TouchableOpacity
                onPress={onEdit}
                style={[
                  styles.iconButton,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    marginRight: spacing.xs,
                  }
                ]}
              >
                <Edit size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onDelete}
                style={[
                  styles.iconButton,
                  { 
                    backgroundColor: colors.error + '10',
                    borderColor: colors.error,
                    borderRadius: radius.sm,
                  }
                ]}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 100,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 12,
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  sizesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sizeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    borderWidth: 1,
  },
  sizeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreSizes: {
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editDeleteButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default ProductCardItem;