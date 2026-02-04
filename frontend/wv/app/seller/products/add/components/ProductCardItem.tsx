// src/components/shop/ProductCardItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Edit, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { ClothingItem } from '@/src/types';

interface ProductCardItemProps {
  product: ClothingItem;
  viewMode?: 'grid' | 'list';
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  viewMode = 'list',
  onEdit,
  onDelete,
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
      <View style={[
        styles.content,
        viewMode === 'grid' && styles.contentGrid
      ]}>
        {/* Product Image */}
        <Image
          source={{ uri: typeof product.image === 'string' ? product.image : product.image?.url || 'https://via.placeholder.com/150' }}
          style={[
            styles.image,
            viewMode === 'grid' && styles.imageGrid,
            { borderRadius: radius.md }
          ]}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={[
          styles.infoContainer,
          viewMode === 'grid' && { marginLeft: 0 }
        ]}>
          <Text style={[
            styles.name,
            { 
              color: colors.text,
              fontFamily: fonts.semiBold,
              fontSize: 14,
              lineHeight: 18,
              marginTop: 4,
            }
          ]} 
          numberOfLines={2}
          >
            {product.name}
          </Text>
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
            styles.price,
            { 
              color: colors.primary,
              fontFamily: fonts.bold,
              fontSize: 16,
              marginTop: 8,
            }
          ]}>
            {product.price}
          </Text>

          {/* Action Buttons */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onEdit}
              style={[
                styles.actionButton,
                { 
                  backgroundColor: colors.primary + '10',
                  borderRadius: radius.sm,
                  flex: 1,
                  marginRight: spacing.xs,
                }
              ]}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={[
                styles.actionText,
                { 
                  color: colors.primary,
                  fontFamily: fonts.medium,
                  fontSize: 12,
                  marginLeft: 4,
                }
              ]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDelete}
              style={[
                styles.actionButton,
                { 
                  backgroundColor: colors.error + '10',
                  borderRadius: radius.sm,
                  flex: 1,
                }
              ]}
            >
              <Trash2 size={16} color={colors.error} />
              <Text style={[
                styles.actionText,
                { 
                  color: colors.error,
                  fontFamily: fonts.medium,
                  fontSize: 12,
                  marginLeft: 4,
                }
              ]}>
                Delete
              </Text>
            </TouchableOpacity>
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
  contentGrid: {
    flexDirection: 'column',
    padding: 8,
  },
  image: {
    width: 80,
    height: 100,
  },
  imageGrid: {
    width: '100%',
    height: 140,
    marginBottom: 8,
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
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ProductCardItem;