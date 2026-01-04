import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { CheckCircle, Package, Truck, Home, Share2, Download } from 'lucide-react-native';
import { ClothingItem, ShippingAddress, PaymentMethod } from '@/src/types';

interface OrderConfirmationProps {
  orderId: string;
  item: ClothingItem;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  onContinueShopping: () => void;
  onViewOrder: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  item,
  shippingAddress,
  paymentMethod,
  onContinueShopping,
  onViewOrder,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
      }}
    >
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
          <CheckCircle size={60} color={colors.success} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
          Order Confirmed!
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          Thank you for your purchase. Your order is being processed.
        </Text>

        {/* Order ID */}
        <View style={[styles.orderIdContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          <Text style={[styles.orderIdLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
            Order ID:
          </Text>
          <Text style={[styles.orderIdValue, { color: colors.primary, fontFamily: fonts.bold }]}>
            {orderId}
          </Text>
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          <View style={styles.summaryHeader}>
            <Package size={20} color={colors.primary} />
            <Text style={[styles.summaryTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Order Summary
            </Text>
          </View>

          <View style={styles.productRow}>
            <Image
              source={{ uri: item.image }}
              style={[styles.productImage, { borderRadius: radius.md }]}
            />
            <View style={styles.productDetails}>
              <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {item.name}
              </Text>
              <Text style={[styles.productBrand, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                {item.brand}
              </Text>
              <Text style={[styles.productPrice, { color: colors.primary, fontFamily: fonts.bold }]}>
                {item.price}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Info */}
        <View style={[styles.shippingContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          <View style={styles.shippingHeader}>
            <Truck size={20} color={colors.primary} />
            <Text style={[styles.shippingTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Shipping Details
            </Text>
          </View>

          <View style={styles.addressContainer}>
            <Home size={16} color={colors.textTertiary} />
            <View style={styles.addressTextContainer}>
              <Text style={[styles.addressName, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {shippingAddress.fullName}
              </Text>
              <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {shippingAddress.street}
              </Text>
              <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </Text>
              <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {shippingAddress.phone}
              </Text>
            </View>
          </View>

          <View style={[styles.deliveryEstimate, { borderTopColor: colors.border }]}>
            <Text style={[styles.estimateLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
              Estimated Delivery:
            </Text>
            <Text style={[styles.estimateValue, { color: colors.primary, fontFamily: fonts.bold }]}>
              Mon, Dec 12 - Fri, Dec 16
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={onContinueShopping}
            style={[
              styles.continueButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={[styles.continueText, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Continue Shopping
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              onPress={onViewOrder}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={[styles.secondaryText, { color: colors.primary, fontFamily: fonts.medium }]}>
                View Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Share2 size={18} color={colors.primary} />
              <Text style={[styles.secondaryText, { color: colors.primary, fontFamily: fonts.medium, marginLeft: 6 }]}>
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Download size={18} color={colors.primary} />
              <Text style={[styles.secondaryText, { color: colors.primary, fontFamily: fonts.medium, marginLeft: 6 }]}>
                Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Steps */}
        <View style={[styles.nextStepsContainer, { backgroundColor: colors.primary + '10', borderRadius: radius.lg }]}>
          <Text style={[styles.nextStepsTitle, { color: colors.primary, fontFamily: fonts.semiBold }]}>
            What&apos;s Next?
          </Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.background, fontFamily: fonts.bold }]}>
                  1
                </Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text, fontFamily: fonts.regular }]}>
                Order confirmation email sent
              </Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.background, fontFamily: fonts.bold }]}>
                  2
                </Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text, fontFamily: fonts.regular }]}>
                Your item will ship within 24 hours
              </Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.background, fontFamily: fonts.bold }]}>
                  3
                </Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text, fontFamily: fonts.regular }]}>
                Tracking number will be emailed to you
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  orderIdLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  orderIdValue: {
    fontSize: 16,
  },
  summaryContainer: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    marginLeft: 12,
  },
  productRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 100,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
  },
  shippingContainer: {
    width: '100%',
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shippingTitle: {
    fontSize: 18,
    marginLeft: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 16,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },
  deliveryEstimate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  estimateLabel: {
    fontSize: 14,
  },
  estimateValue: {
    fontSize: 14,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  continueButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  continueText: {
    fontSize: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 14,
  },
  nextStepsContainer: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  nextStepsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  steps: {
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default OrderConfirmation;