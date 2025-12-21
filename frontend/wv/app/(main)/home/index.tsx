import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Home as HomeIcon,
  Search,
  Camera,
  ShoppingBag,
  UserCircle,
  Heart,
  Bell,
  Zap,
  Sparkles,
  User,
  Shirt,
  ShoppingCart,
  Clock,
  Bookmark,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import * as Animatable from 'react-native-animatable';
import { useTheme } from "../../../src/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const [activeTab, setActiveTab] = useState("home");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  // Animation refs for quick action icons
  const tryOnAnim = useRef(new Animated.Value(0)).current;
  const shopAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;

  // Start icon animations
  useEffect(() => {
    const animateIcons = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tryOnAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(tryOnAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(shopAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shopAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(avatarAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(avatarAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateIcons();
  }, []);

  // Get animated styles
  const getIconAnimation = (animValue: Animated.Value) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.2, 1],
        }),
      },
    ],
  });

  // Mock data for shop posts (like Instagram)
  const shopPosts = [
    {
      id: "1",
      shopName: "Fashionista Boutique",
      shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&q=80",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
      description: "Summer Collection 2024 - Lightweight & Breathable Fabrics",
      likes: 245,
      timestamp: "2 hours ago",
      category: "Dresses",
    },
    {
      id: "2",
      shopName: "Urban Threads",
      shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=400&q=80",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
      description: "Evening Glam Collection - Perfect for special occasions",
      likes: 189,
      timestamp: "4 hours ago",
      category: "Evening Wear",
    },
    {
      id: "3",
      shopName: "Casual Comfort Co.",
      shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=400&q=80",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
      description: "Everyday essentials for the modern wardrobe",
      likes: 312,
      timestamp: "1 day ago",
      category: "Casual",
    },
    {
      id: "4",
      shopName: "Luxe Apparel",
      shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&q=80",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      description: "Black Evening Dress - Now available in 3 colors",
      likes: 156,
      timestamp: "2 days ago",
      category: "Luxury",
    },
  ];

  // Quick actions (only 3)
  const quickActions = [
    {
      id: 1,
      icon: Camera,
      label: "Try On",
      color: "black",
      route: "/try-on",
      animValue: tryOnAnim,
      getAnimation: getIconAnimation(tryOnAnim)
    },
    {
      id: 2,
      icon: ShoppingCart,
      label: "Shop Now",
      color: "#FF6B8B",
      route: "/search",
      animValue: shopAnim,
      getAnimation: getIconAnimation(shopAnim)
    },
    {
      id: 3,
      icon: User,
      label: "Avatar",
      color: "#00bcd4",
      route: "/avatar",
      animValue: avatarAnim,
      getAnimation: getIconAnimation(avatarAnim)
    },
  ];

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSavePost = (postId: string) => {
    setSavedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Header with Logo and Heart Icon */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.logo, { color: colors.text }]}>Wearvirtually</Text>
          <TouchableOpacity
            style={[styles.heartButton, { backgroundColor: isDark ? colors.surface : '#FFF5F7' }]}
            onPress={() => router.push("/(main)/saved-items")}
          >
            <Heart size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions Grid - Only 3 items */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickAction, { backgroundColor: action.color }]}
                  onPress={() => router.push(action.route)}
                >
                  <Animated.View
                    style={[styles.actionIconContainer, action.getAnimation]}
                  >
                    <Icon size={24} color="#FFFFFF" />
                  </Animated.View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Shop Posts Feed */}
        <View style={styles.feedSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest from Shops</Text>

          {shopPosts.map((post) => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.shopInfo}>
                  <Image
                    source={{ uri: post.shopLogo }}
                    style={styles.shopLogo}
                  />
                  <View>
                    <Text style={[styles.shopName, { color: colors.text }]}>{post.shopName}</Text>
                    <Text style={[styles.postTime, { color: colors.textTertiary }]}>{post.timestamp}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={[styles.moreOptions, { color: colors.textSecondary }]}>•••</Text>
                </TouchableOpacity>
              </View>

              {/* Post Image */}
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />

              {/* Post Actions */}
              <View style={styles.postActions}>
                <View style={styles.postActionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <Heart
                      size={24}
                      color={likedPosts.includes(post.id) ? "#FF6B8B" : colors.textSecondary}
                      fill={likedPosts.includes(post.id) ? "#FF6B8B" : "none"}
                    />
                    <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.likes}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/try-on/${post.id}`)}
                  >
                    <Zap size={24} color="#7B61FF" />
                    <Text style={styles.actionText}>Try It</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSavePost(post.id)}
                >
                  <Bookmark
                    size={20}
                    color={savedPosts.includes(post.id) ? "#7B61FF" : colors.textSecondary}
                    fill={savedPosts.includes(post.id) ? "#7B61FF" : "none"}
                  />
                </TouchableOpacity>
              </View>

              {/* Post Description */}
              <View style={styles.postDescription}>
                <Text style={[styles.shopName, { color: colors.text }]}>{post.shopName}</Text>
                <Text style={[styles.postText, { color: colors.text }]}>{post.description}</Text>
                <Text style={styles.postCategory}>#{post.category}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom spacing for footer */}
        <View style={{ height: 80 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5, // Makes letters appear more connected
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickAction: {
    width: (width - 60) / 3,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  feedSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shopLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  shopName: {
    fontSize: 14,
    fontWeight: "600",
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  moreOptions: {
    fontSize: 20,
    letterSpacing: 2,
  },
  postImage: {
    width: "100%",
    height: width - 40,
    backgroundColor: "#F5F5F5",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  postActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B61FF",
  },
  saveButton: {
    padding: 6,
  },
  postDescription: {
    padding: 12,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  postCategory: {
    fontSize: 12,
    color: "#7B61FF",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  footerTabText: {
    fontSize: 10,
    marginTop: 4,
    color: "#666666",
    fontWeight: "500",
  },
  footerTabTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});