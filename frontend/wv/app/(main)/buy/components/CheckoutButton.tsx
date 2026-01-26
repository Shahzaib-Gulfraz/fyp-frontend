import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { Lock, Check } from 'lucide-react-native';

interface CheckoutButtonProps {
  onPress: () => void;
  isProcessing: boolean;
  isDisabled: boolean;
  total: number;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  onPress,
  isProcessing,
  isDisabled,
  total,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
          Total Amount
        </Text>
        <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
          ${total.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled || isProcessing}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? colors.textTertiary + '40' : colors.primary,
            borderRadius: radius.lg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDisabled ? 0 : 0.2,
            shadowRadius: 8,
            elevation: isDisabled ? 0 : 4,
          },
        ]}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <View style={styles.buttonContent}>
            <Lock size={20} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background, fontFamily: fonts.semiBold }]}>
              Place Order
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.assuranceContainer}>
        <Check size={14} color={colors.success} />
        <Text style={[styles.assuranceText, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
          By placing your order, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  assuranceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  assuranceText: {
    fontSize: 11,
    marginLeft: 6,
    textAlign: 'center',
    flex: 1,
  },
});

export default CheckoutButton;