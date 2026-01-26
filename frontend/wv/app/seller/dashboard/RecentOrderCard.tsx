// src/components/shop/RecentOrderCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Package, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface RecentOrderCardProps {
  id: string;
  customerName: string;
  productName: string;
  productImage: string;
  price: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  onPress: () => void;
}

const RecentOrderCard: React.FC<RecentOrderCardProps> = ({
  id,
  customerName,
  productName,
  productImage,
  price,
  status,
  date,
  onPress,
}) => {
  const { colors } = useTheme();
  const { radius, fonts, spacing } = appTheme.tokens;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { color: colors.accent, icon: <Clock size={14} />, text: 'Pending' };
      case 'processing':
        return { color: colors.primary, icon: <Package size={14} />, text: 'Processing' };
      case 'shipped':
        return { color: '#FF9800', icon: <Package size={14} />, text: 'Shipped' };
      case 'delivered':
        return { color: colors.success, icon: <CheckCircle size={14} />, text: 'Delivered' };
      case 'cancelled':
        return { color: colors.error, icon: <AlertCircle size={14} />, text: 'Cancelled' };
      default:
        return { color: colors.textTertiary, icon: <Package size={14} />, text: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.md,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderId, { color: colors.text, fontFamily: fonts.semiBold }]}>
            Order #{id}
          </Text>
          <Text style={[styles.customerName, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {customerName}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.color + '15',
              borderColor: statusConfig.color,
              borderRadius: radius.sm,
            },
          ]}
        >
          <View style={styles.statusContent}>
            {statusConfig.icon}
            <Text
              style={[
                styles.statusText,
                { color: statusConfig.color, fontFamily: fonts.medium, marginLeft: 6 },
              ]}
            >
              {statusConfig.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Image
          source={{ uri: typeof productImage === 'string' ? productImage : productImage?.url || 'https://via.placeholder.com/50' }}
          style={[styles.productImage, { borderRadius: radius.sm }]}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.medium }]}>
            {productName}
          </Text>
          <Text style={[styles.price, { color: colors.primary, fontFamily: fonts.bold }]}>
            {price}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
          {date}
        </Text>
        <Text style={[styles.actionText, { color: colors.primary, fontFamily: fonts.medium }]}>
          View Details ›
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: appTheme.tokens.spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.tokens.spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.tokens.spacing.sm,
  },
  productImage: {
    width: 60,
    height: 60,
  },
  productDetails: {
    flex: 1,
    marginLeft: appTheme.tokens.spacing.md,
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: appTheme.tokens.spacing.sm,
    borderTopWidth: 1,
  },
  date: {
    fontSize: 11,
  },
  actionText: {
    fontSize: 12,
  },
});

export default RecentOrderCard;
