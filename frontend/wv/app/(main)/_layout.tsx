import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname, Slot, useFocusEffect } from "expo-router";
import {
  Home as HomeIcon,
  Search,
  Camera,
  MessageCircle,
  UserCircle,
  LayoutDashboard,
  Store,
  Newspaper,
  Users,
} from "lucide-react-native";
import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { useSocket } from "@/src/context/SocketContext";
import { chatService } from "@/src/api/chatService";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { colors } = theme;
  const { user } = useUser();
  const { socket } = useSocket();

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const isShopOwner = user?.role === "shop_owner";

  const scaleAnimations = useRef(
    Array(6)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await chatService.getConversations();
      const conversations = response.data?.data?.conversations || response.data?.conversations || [];
      
      // Calculate total unread messages
      let totalUnread = 0;
      conversations.forEach((conv: any) => {
        if (conv.unreadCount && user?.id) {
          const count = conv.unreadCount[user.id] || 0;
          totalUnread += count;
        }
      });
      
      console.log('[Footer] Total unread messages:', totalUnread);
      setUnreadMessageCount(totalUnread);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [user?.id]);

  // Use focus effect to refresh count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  // Real-time updates
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNewMessage = (data: any) => {
      console.log('[Footer] New message received:', data);
      // Only increment if the message is NOT from the current user
      if (data.sender && data.sender !== user.id && data.sender !== user._id && String(data.sender) !== String(user.id)) {
        setUnreadMessageCount(prev => {
          const newCount = prev + 1;
          console.log('[Footer] Incrementing count from', prev, 'to:', newCount);
          return newCount;
        });
      } else {
        console.log('[Footer] Message from self, not incrementing. Sender:', data.sender, 'User:', user.id);
      }
    };

    const handleMessageRead = (data: any) => {
      console.log('[Footer] Messages marked as read:', data);
      // Refresh count when messages are marked as read
      fetchUnreadCount();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message:new', handleNewMessage);
    socket.on('messages_read', handleMessageRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message:new', handleNewMessage);
      socket.off('messages_read', handleMessageRead);
    };
  }, [socket, user?.id, user?._id, fetchUnreadCount]);

  const userFooterTabs = [
    { id: "home", icon: HomeIcon, route: "/home" },
    { id: "feed", icon: Newspaper, route: "/social/feed" },
    { id: "friends", icon: Users, route: "/friends" },
    { id: "try-on", icon: Camera, route: "/try-on" },
    { id: "chats", icon: MessageCircle, route: "/chats" },
    { id: "profile", icon: UserCircle, route: "/profile" },
  ];


  const shopOwnerFooterTabs = [
    { id: "dashboard", icon: LayoutDashboard, route: "/shop/my/profile" },
    { id: "search", icon: Search, route: "/search" },
    { id: "productScan", icon: Camera, route: "/shop/addProduct" },
    { id: "chats", icon: MessageCircle, route: "/chats" },
    { id: "profile", icon: Store, route: "/shop/shopProfile" },
  ];

  const footerTabs = isShopOwner ? shopOwnerFooterTabs : userFooterTabs;

  const getActiveTab = () => {
    if (isShopOwner) {
      if (pathname.includes("/shop/my/profile")) return "dashboard";
      if (pathname.includes("/search")) return "search";
      if (pathname.includes("/addProduct")) return "addProduct";
      if (pathname.includes("/chats")) return "chats";
      if (pathname.includes("/shop/shopProfile")) return "shopProfile";
      return "dashboard";
    }

    if (pathname.includes("/home")) return "home";
    if (pathname.includes("/social/feed")) return "feed";
    if (pathname.includes("/friends")) return "friends";
    if (pathname.includes("/search")) return "search";
    if (pathname.includes("/try-on")) return "try-on";
    if (pathname.includes("/chats")) return "chats";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabPress = (route: string, index: number) => {
    Animated.sequence([
      Animated.spring(scaleAnimations[index], {
        toValue: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => router.push(route), 120);
  };

  const getIconColor = (isActive: boolean) =>
    isActive ? colors.primary : colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View
        style={[
          styles.footerContainer,
          {
            backgroundColor: colors.surface,
            paddingBottom: Math.max(insets.bottom, 8),
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.footer}>
          {footerTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabPress(tab.route, index)}
                activeOpacity={0.75}
                style={styles.footerTab}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: scaleAnimations[index] }],
                      backgroundColor: isActive
                        ? colors.primary + "15"
                        : "transparent",
                    },
                  ]}
                >
                  <Icon
                    size={26}
                    strokeWidth={2}
                    color={getIconColor(isActive)}
                  />

                  {tab.id === "chats" && unreadMessageCount > 0 && (
                    <View
                      style={[
                        styles.chatBadge,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.surface,
                        },
                      ]}
                    >
                      <Text style={styles.chatBadgeText}>
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },

  footerContainer: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 12 },
    }),
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },

  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  chatBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  chatBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
