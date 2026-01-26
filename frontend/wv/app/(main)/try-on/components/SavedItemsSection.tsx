import React, { useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { Zap, Star, ChevronRight } from 'lucide-react-native';
import { ClothingItem } from '../types';

interface SavedItemsSectionProps {
  items: ClothingItem[];
  onTryOnItem: (item: ClothingItem) => void;
  onSeeAll?: () => void;
}

const SavedItemsSection: React.FC<SavedItemsSectionProps> = ({ 
  items, 
  onTryOnItem,
  onSeeAll 
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const renderItem = useCallback(({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onTryOnItem(item)}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.divider || colors.border,
        borderRadius: radius.lg,
        marginRight: spacing.md,
        width: 168,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: '100%',
          height: 140,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg
        }}
        resizeMode="cover"
      />
      
      {/* Discount Badge */}
      <View style={{
        position: 'absolute',
        backgroundColor: colors.accent,
        top: spacing.sm,
        left: spacing.sm,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      }}>
        <Text style={{
          color: colors.text,
          fontFamily: fonts.medium,
          fontSize: 10,
          fontWeight: '700',
        }}>
          -20%
        </Text>
      </View>
      
      {/* Try On Button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onTryOnItem(item);
        }}
        style={{
          position: 'absolute',
          backgroundColor: colors.primary,
          top: spacing.sm,
          right: spacing.sm,
          width: 36,
          height: 36,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Zap size={16} color={colors.onPrimary || '#FFFFFF'} />
      </TouchableOpacity>
      
      {/* Product Info */}
      <View style={{ padding: spacing.md }}>
        <Text 
          style={{
            color: colors.textSecondary,
            fontFamily: fonts.medium,
            marginBottom: spacing.xs,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
          numberOfLines={1}
        >
          {item.brand}
        </Text>
        
        <Text 
          style={{
            color: colors.text,
            fontFamily: fonts.semiBold,
            marginBottom: spacing.sm,
            fontSize: 14,
            lineHeight: 18,
            minHeight: 36,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Text style={{
            color: colors.text,
            fontFamily: fonts.bold,
            fontSize: 16,
          }}>
            {item.price}
          </Text>
          
          {item.originalPrice && (
            <Text style={{
              color: colors.textTertiary,
              fontFamily: fonts.regular,
              fontSize: 12,
              textDecorationLine: 'line-through',
            }}>
              {item.originalPrice}
            </Text>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={{
              color: colors.textSecondary,
              fontFamily: fonts.regular,
              fontSize: 12,
            }}>
              {item.rating}
            </Text>
          </View>
          
          <View style={{ padding: 4, borderRadius: 4, backgroundColor: colors.primary + '10' }}>
            <Zap size={12} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [colors, radius, spacing, fonts]);

  const headerComponent = useCallback(() => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    }}>
      <View>
        <Text style={{
          color: colors.text,
          fontFamily: fonts.semiBold,
          marginBottom: spacing.xs,
          fontSize: 20,
        }}>
          Saved for Try-On
        </Text>
        <Text style={{
          color: colors.textSecondary,
          fontFamily: fonts.regular,
          fontSize: 13,
        }}>
          {items.length} items ready to try
        </Text>
      </View>
      
      {onSeeAll && (
        <TouchableOpacity 
          onPress={onSeeAll}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 }}
        >
          <Text style={{
            color: colors.primary,
            fontFamily: fonts.medium,
            fontSize: 14,
            fontWeight: '600',
            marginRight: 4,
          }}>
            See All
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  ), [colors, fonts, spacing.xs, items.length, onSeeAll]);

  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
      }}
    >
      {headerComponent()}
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<View style={{ width: 4 }} />}
        contentContainerStyle={{ paddingBottom: 4 }}
        snapToInterval={168 + spacing.md}
        decelerationRate="fast"
      />
    </View>
  );
};

export default SavedItemsSection;