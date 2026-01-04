import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Check, ShoppingBag, Camera, Trash2, Heart, MoreVertical } from 'lucide-react-native';

interface SavedItemCardProps {
  item: {
    id: string;
    name: string;
    shop: string;
    price: string;
    image: string;
    size: string;
    color: string;
    savedDate: string;
    category: string;
    rating?: number;
  };
  isSelecting: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onTryOn: (id: string) => void;
  onDelete: (id: string) => void;
  onShop: () => void;
}

const SavedItemCard: React.FC<SavedItemCardProps> = ({
  item,
  isSelecting,
  isSelected,
  onSelect,
  onTryOn,
  onDelete,
  onShop,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onLongPress={() => !isSelecting && onSelect(item.id)}
      onPress={() => isSelecting && onSelect(item.id)}
      activeOpacity={0.9}
    >
      {/* Selection Overlay */}
      {isSelecting && (
        <View style={[styles.selectOverlay, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
          <View style={[
            styles.checkbox,
            { borderColor: colors.border },
            isSelected && [
              styles.checkboxSelected,
              { backgroundColor: colors.primary, borderColor: colors.primary }
            ]
          ]}>
            {isSelected && <Check size={16} color="#FFFFFF" />}
          </View>
        </View>
      )}

      {/* Item Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Item Details */}
      <View style={styles.details}>
        <View style={styles.detailsHeader}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          
        </View>
        
        <Text style={[styles.shop, { color: colors.primary }]}>{item.shop}</Text>
        
        <View style={styles.metaContainer}>
          <View style={[styles.metaTag, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.size}
            </Text>
          </View>
          <View style={[styles.metaTag, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.color}
            </Text>
          </View>
          {item.rating && (
            <View style={[styles.metaTag, { backgroundColor: colors.surface }]}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                ⭐ {item.rating}
              </Text>
            </View>
          )}
        </View>

        {/* Price and Date */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>{item.price}</Text>
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            Saved {item.savedDate}
          </Text>
        </View>

        {/* Action Buttons */}
{!isSelecting && (
  <View style={styles.actionButtons}>
    {/* Shop */}
    <TouchableOpacity
      style={[
        styles.actionButton,
        styles.primaryButton,
        { backgroundColor: colors.primary },
      ]}
      onPress={onShop}
    >
      <ShoppingBag size={18} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>Shop</Text>
    </TouchableOpacity>

    {/* Try It */}
    <TouchableOpacity
      style={[
        styles.actionButton,
        styles.primaryButton,
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onTryOn(item.id)}
    >
      <Camera size={18} color={colors.text} />
      <Text style={[styles.actionButtonText, { color: colors.text }]}>
        Try It
      </Text>
    </TouchableOpacity>

    {/* Remove (icon only) */}
    <TouchableOpacity
      style={[
        styles.deleteButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.error,
        },
      ]}
      onPress={() => onDelete(item.id)}
    >
      <Trash2 size={20} color={colors.error} />
    </TouchableOpacity>
  </View>
)}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  checkboxSelected: {
    borderWidth: 0,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  details: {
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  shop: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  actionButtons: {
  flexDirection: 'row',
  gap: 10,
},


primaryButton: {
  flex: 1.4, // makes Shop & Try It bigger
},

deleteButton: {
  width: 44,
  height: 44,
  borderRadius: 10,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SavedItemCard;