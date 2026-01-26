// app/(main)/home/components/HomeHeader.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, ShoppingCart, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocket } from '@/src/context/SocketContext';
import { styles } from '../styles';

interface HomeHeaderProps {
  insets: {
    top: number;
  };
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ insets }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { unreadNotifications } = useSocket();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const cartService = require('@/src/api/cartService').default;
      const response = await cartService.getCart();
      if (response?.cart?.items) {
        const totalItems = response.cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartItemCount(totalItems);
      }
    } catch (error) {
      console.log('Failed to fetch cart count:', error);
    }
  };

  return (
    <View style={[styles.header, {
      paddingTop: insets.top + 10,
      backgroundColor: colors.background,
      borderBottomColor: colors.divider
    }]}>
      <View style={styles.headerContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.logo, { color: colors.text }]}>WearVirtually</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>

          <TouchableOpacity
            style={[styles.heartButton, { backgroundColor: isDark ? colors.surface : '#FFF5F7', position: 'relative' }]}
            onPress={() => router.push("/(main)/notifications")}
          >
            <Bell size={24} color={colors.primary} />
            {unreadNotifications > 0 && (
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: colors.primary,
                borderRadius: 8,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: colors.background
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heartButton, { backgroundColor: isDark ? colors.surface : '#FFF5F7', position: 'relative' }]}
            onPress={() => router.push("/(main)/cart")}
          >
            <ShoppingCart size={24} color={colors.primary} />
            {cartItemCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: colors.primary,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
                borderWidth: 1.5,
                borderColor: colors.background
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heartButton, { backgroundColor: isDark ? colors.surface : '#FFF5F7' }]}
            onPress={() => router.push("/(main)/saved-items")}
          >
            <Heart size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};