import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { ChevronRight } from 'lucide-react-native';
import { ClothingItem, OrderSummary as OrderSummaryType } from '@/src/types';

interface OrderSummaryProps {
  item: ClothingItem;
  selectedSize: string;
  selectedColor: string;
  orderSummary: OrderSummaryType;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  item,
  selectedSize,
  selectedColor,
  orderSummary,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const getColorDisplayName = (color: string) => {
    const map: Record<string, string> = {
      black: 'Black',
      white: 'White',
      red: 'Red',
      blue: 'Blue',
      green: 'Green',
      yellow: 'Yellow',
      gray: 'Gray',
      navy: 'Navy',
      multi: 'Multi-color',
      pink: 'Pink',
    };
    return map[color.toLowerCase()] || color;
  };

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }]}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
        Order Summary
      </Text>

      {/* Product Card */}
      <View style={[styles.productCard, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { borderRadius: radius.md }]}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={[styles.brand, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
            {item.brand}
          </Text>
          <Text style={[styles.name, { color: colors.text, fontFamily: fonts.semiBold }]}>
            {item.name}
          </Text>

          <View style={styles.selectionContainer}>
            <View style={styles.selectionItem}>
              <Text style={[styles.selectionLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
                Size:
              </Text>
              <Text style={[styles.selectionValue, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {selectedSize}
              </Text>
            </View>

            <View style={styles.selectionItem}>
              <Text style={[styles.selectionLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
                Color:
              </Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorDot, { backgroundColor: selectedColor.toLowerCase() }]} />
                <Text style={[styles.selectionValue, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {getColorDisplayName(selectedColor)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.priceContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.priceLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
              Price:
            </Text>
            <Text style={[styles.priceValue, { color: colors.text, fontFamily: fonts.bold }]}>
              {item.price}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Breakdown */}
      <View style={[styles.breakdownContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
        <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            Subtotal
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.text, fontFamily: fonts.regular }]}>
            ${orderSummary.subtotal.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            Shipping
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.text, fontFamily: fonts.regular }]}>
            ${orderSummary.shipping.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            Tax
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.text, fontFamily: fonts.regular }]}>
            ${orderSummary.tax.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.primary, fontFamily: fonts.medium }]}>
            Discount
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.primary, fontFamily: fonts.medium }]}>
            -${orderSummary.discount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
            ${orderSummary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Promo Code */}
      <TouchableOpacity
        style={[styles.promoContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}
      >
        <View style={styles.promoContent}>
          <Text style={[styles.promoLabel, { color: colors.primary, fontFamily: fonts.medium }]}>
            Add Promo Code
          </Text>
          <ChevronRight size={20} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  image: {
    width: 100,
    height: 120,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  brand: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  selectionContainer: {
    marginBottom: 12,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionLabel: {
    fontSize: 13,
    width: 60,
  },
  selectionValue: {
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
  },
  breakdownContainer: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 20,
  },
  promoContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoLabel: {
    fontSize: 16,
  },
});

export default OrderSummary;