import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { ShoppingCart, Bell, Heart, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSocket } from "@/src/context/SocketContext";

interface TryOnHeaderProps {
  title: string;
  onBack: () => void;
}

const TryOnHeader: React.FC<TryOnHeaderProps> = ({ title, onBack }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
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
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* Title */}
      <View style={[styles.leftSection, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
            <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>

      {/* Icons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Notifications */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/notifications")}
          style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
        >
          <Bell size={24} color={colors.primary} />
          {unreadNotifications > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/cart")}
          style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
        >
          <ShoppingCart size={24} color={colors.primary} />
          {cartItemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Text style={styles.badgeText}>
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Saved Items */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/saved-items")}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
        >
          <Heart size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TryOnHeader;


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});
