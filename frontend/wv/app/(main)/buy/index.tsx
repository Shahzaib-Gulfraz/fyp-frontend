import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import Header from '@/src/components/Header';
import {
  OrderSummary,
  ShippingForm,
  PaymentMethod,
  CheckoutButton,
} from './components';
import { ShippingAddress, PaymentMethod as PaymentMethodType } from '@/src/types';



const BuyNowScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { spacing } = appTheme.tokens;

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* ─────────────────────────────
     DEBUG LOGGING
  ────────────────────────────── */
  console.log('[BuyNowScreen] Params received:', params);

  let item = null;
  try {
    if (params.item) {
      item = JSON.parse(params.item as string);
      console.log('[BuyNowScreen] Parsed item:', item?.name);
    } else {
      console.warn('[BuyNowScreen] No item param found in:', params);
    }
  } catch (e) {
    console.error('[BuyNowScreen] Error parsing item param:', e);
  }

  const selectedSize = params.selectedSize as string;
  const selectedColor = params.selectedColor as string;

  // Fallback UI if item is missing
  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header
          title="Checkout Error"
          showBackButton
          rightIcon={null}
          onBackPress={() => router.back()}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ fontSize: 18, color: colors.error, marginBottom: 16 }}>
            Unable to load item details.
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
            Please go back and try selecting the item again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: colors.primary,
              borderRadius: 8
            }}
          >
            <Text style={{ color: colors.surface, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);

    // For now, simple confirmation alert or navigate to home
    router.replace('/(tabs)/home');
  };

  const orderSummary = {
    subtotal: parseFloat(item.price.replace('$', '')),
    shipping: 5.99,
    tax: 2.50,
    discount: 10.00,
    total: parseFloat(item.price.replace('$', '')) + 5.99 + 2.50 - 10.00,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Checkout"
        showBackButton
        rightIcon={null}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
        >
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Order Summary */}
            <OrderSummary
              item={item}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              orderSummary={orderSummary}
            />

            {/* Shipping Form */}
            <ShippingForm
              onAddressSelect={setShippingAddress}
              selectedAddress={shippingAddress}
            />

            {/* Payment Method */}
            <PaymentMethod
              onPaymentSelect={setPaymentMethod}
              selectedMethod={paymentMethod}
            />
          </View>
        </ScrollView>

        {/* Checkout Button */}
        <CheckoutButton
          isProcessing={isProcessing}
          isDisabled={!shippingAddress || !paymentMethod}
          onPress={handlePlaceOrder}
          total={orderSummary.total}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BuyNowScreen;