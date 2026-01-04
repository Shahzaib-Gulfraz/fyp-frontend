    import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { Check, CreditCard, Lock, Shield } from 'lucide-react-native';
import { PaymentMethod as PaymentMethodType } from '@/src/types';

interface PaymentMethodProps {
  onPaymentSelect: (method: PaymentMethodType) => void;
  selectedMethod: PaymentMethodType | null;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ onPaymentSelect, selectedMethod }) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const [paymentMethods] = useState<PaymentMethodType[]>([
    {
      id: '1',
      type: 'credit_card',
      lastFour: '4242',
      cardHolder: 'John Doe',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      isDefault: false,
    },
    {
      id: '3',
      type: 'apple_pay',
      isDefault: false,
    },
    {
      id: '4',
      type: 'google_pay',
      isDefault: false,
    },
  ]);

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard size={24} color={colors.text} />;
      case 'paypal':
        return <Text style={[styles.paypalText, { color: '#003087', fontFamily: fonts.bold }]}>PayPal</Text>;
      case 'apple_pay':
        return <Text style={[styles.applePayText, { color: colors.text, fontFamily: fonts.semiBold }]}> Pay</Text>;
      case 'google_pay':
        return <Text style={[styles.googlePayText, { color: colors.text, fontFamily: fonts.medium }]}>Google Pay</Text>;
      default:
        return <CreditCard size={24} color={colors.text} />;
    }
  };

  const getPaymentLabel = (method: PaymentMethodType) => {
    switch (method.type) {
      case 'credit_card':
        return `•••• ${method.lastFour}`;
      case 'paypal':
        return 'Pay with PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return '';
    }
  };

  const handleSelectMethod = (method: PaymentMethodType) => {
    onPaymentSelect(method);
  };

  return (
    <View style={[styles.container, { marginBottom: spacing.xl }]}>
      <View style={styles.header}>
        <CreditCard size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.semiBold, marginLeft: spacing.sm }]}>
          Payment Method
        </Text>
      </View>

      <View style={[styles.methodsContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => handleSelectMethod(method)}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.surface,
                borderColor: selectedMethod?.id === method.id ? colors.primary : colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodInfo}>
                <View style={styles.methodIcon}>
                  {getPaymentIcon(method.type)}
                </View>
                <View>
                  <Text style={[styles.methodLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                    {getPaymentLabel(method)}
                  </Text>
                  {method.type === 'credit_card' && (
                    <Text style={[styles.methodDetails, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                      {method.cardHolder} • Expires {method.expiryDate}
                    </Text>
                  )}
                </View>
              </View>

              {selectedMethod?.id === method.id ? (
                <View style={[styles.selectedCircle, { backgroundColor: colors.primary }]}>
                  <Check size={16} color={colors.background} />
                </View>
              ) : (
                <View style={[styles.unselectedCircle, { borderColor: colors.border }]} />
              )}
            </View>

            {method.isDefault && method.type === 'credit_card' && (
              <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.defaultText, { color: colors.primary, fontFamily: fonts.medium }]}>
                  Default
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Security Assurance */}
      <View style={[styles.securityContainer, { backgroundColor: colors.surface + '80', borderRadius: radius.lg }]}>
        <View style={styles.securityHeader}>
          <Shield size={20} color={colors.success} />
          <Text style={[styles.securityTitle, { color: colors.text, fontFamily: fonts.semiBold, marginLeft: spacing.sm }]}>
            Secure Payment
          </Text>
        </View>
        <Text style={[styles.securityText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          Your payment information is encrypted and secure. We never store your credit card details.
        </Text>
        
        <View style={styles.securityIcons}>
          <Lock size={16} color={colors.textTertiary} />
          <Text style={[styles.securityNote, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            256-bit SSL encryption
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  methodsContainer: {
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginBottom: 16,
  },
  methodCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  methodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  methodDetails: {
    fontSize: 12,
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  defaultText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  paypalText: {
    fontSize: 18,
  },
  applePayText: {
    fontSize: 18,
  },
  googlePayText: {
    fontSize: 16,
  },
  securityContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  securityIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityNote: {
    fontSize: 12,
    marginLeft: 6,
  },
});

export default PaymentMethod;