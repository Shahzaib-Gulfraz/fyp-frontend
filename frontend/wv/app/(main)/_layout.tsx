import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import {
  Home as HomeIcon,
  Search,
  Camera,
  MessageCircle,
  UserCircle,
  LayoutDashboard,
  Store,
} from "lucide-react-native";
import { Slot } from "expo-router";
import { useRef } from "react";
import { useTheme } from "../../src/context/ThemeContext";
import { useUser } from "../../src/context/UserContext";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  
  const { user } = useUser();
  const isShopOwner = user?.role === 'shop_owner';

  const scaleAnimations = useRef([
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ]).current;

  const userFooterTabs = [
    { id: "home", icon: HomeIcon, label: "Home", route: "/(main)/home" },
    { id: "search", icon: Search, label: "Search", route: "/(main)/search" },
    { id: "try-on", icon: Camera, label: "Try-On", route: "/(main)/try-on" },
    {
      id: "chats",
      icon: MessageCircle,
      label: "Chats",
      route: "/(main)/chats",
    },
    {
      id: "profile",
      icon: UserCircle,
      label: "Profile",
      route: "/(main)/profile",
    },
  ];

  const shopOwnerFooterTabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", route: "/(main)/shop/dashboard" },
    { id: "search", icon: Search, label: "Search", route: "/(main)/search" },
    { id: "product-scan", icon: Camera, label: "Scan", route: "/(main)/shop/productScan" },
    {
      id: "chats",
      icon: MessageCircle,
      label: "Chats",
      route: "/(main)/chats",
    },
    {
      id: "profile",
      icon: Store,
      label: "Shop",
      route: "/(main)/shop/profile",
    },
  ];

  const footerTabs = isShopOwner ? shopOwnerFooterTabs : userFooterTabs;

  const getActiveTab = () => {
    const currentRoute = pathname;
    
    if (isShopOwner) {
      if (currentRoute === "/(main)/shop/dashboard" || currentRoute === "/(main)/shop/") return "dashboard";
      if (currentRoute.includes("/search")) return "search";
      if (currentRoute.includes("/shop/productScan") || currentRoute.includes("/shop/register")) return "productScan";
      if (currentRoute.includes("/chats")) return "chats";
      if (currentRoute.includes("/shop/profile") || currentRoute.includes("/shop/")) return "profile";
      return "dashboard";
    } else {
      if (currentRoute === "/(main)/home" || currentRoute === "/(main)/") return "home";
      if (currentRoute.includes("/search")) return "search";
      if (currentRoute.includes("/try-on")) return "try-on";
      if (currentRoute.includes("/chats")) return "chats";
      if (currentRoute.includes("/profile")) return "profile";
      return "home";
    }
  };

  const activeTab = getActiveTab();

  const handleTabPress = (route: string, index: number) => {
    Animated.sequence([
      Animated.spring(scaleAnimations[index], {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }),
      Animated.spring(scaleAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }),
    ]).start();

    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  const getIconColor = (tabId: string, isActive: boolean) => {
    if (isActive) return colors.accent;
    
    if (isShopOwner && (tabId === "dashboard" || tabId === "profile")) {
      return colors.primary;
    }
    
    return colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main Content Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Footer Navigation */}
      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            backgroundColor: colors.background
          },
        ]}
      >
        {/* Dull black line at the top of footer */}
        <View style={[styles.topLine, { backgroundColor: colors.border }]} />

        <View style={styles.footer}>
          {footerTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const iconColor = getIconColor(tab.id, isActive);

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.footerTab}
                onPress={() => handleTabPress(tab.route, index)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleAnimations[index] }] },
                  ]}
                >
                  <Icon
                    size={28}
                    color={iconColor}
                    strokeWidth={2}
                  />

                  {/* Special indicator for shop owner tabs */}
                  {isShopOwner && (tab.id === "dashboard" || tab.id === "profile") && !isActive && (
                    <View style={[styles.shopIndicator, { borderColor: colors.background }]}>
                      <Text style={styles.shopIndicatorText}>SHOP</Text>
                    </View>
                  )}

                  {/* Chat badge for unread messages */}
                  {tab.id === "chats" && (
                    <View style={[styles.chatBadge, { borderColor: colors.background }]}>
                      <Text style={styles.chatBadgeText}>3</Text>
                    </View>
                  )}
                </Animated.View>
                
                {/* Removed Text Label */}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footerContainer: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
      },
      android: {
        elevation: 16,
        shadowColor: "#000",
      },
    }),
  },
  topLine: {
    height: 1,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  iconContainer: {
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  // Removed tabLabel style
  shopIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#7B61FF",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#7B61FF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shopIndicatorText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  chatBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF4081",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#FF4081",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chatBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});