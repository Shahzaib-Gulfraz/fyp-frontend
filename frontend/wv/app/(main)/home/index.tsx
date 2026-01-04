// app/(main)/home/index.tsx
import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { HomeHeader } from "./components/HomeHeader";
import { QuickActions } from "./components/QuickActions";
import { ShopPostCard } from "./components/ShopPostCard";
import { CommentsModal } from "./components/CommentsModal";
import { ShopActionsModal } from "./components/ShopActionModal";

import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "./styles";

const { height } = Dimensions.get("window");

// Mock data for shop posts (same as before)
const shopPosts = [
  {
    id: "1",
    shopName: "Fashionista Boutique",
    shopLogo:
      "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&q=80",
    shopDescription:
      "Premium fashion boutique specializing in summer collections and exclusive designer pieces.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    description: "Summer Collection 2024 - Lightweight & Breathable Fabrics",
    likes: 245,
    comments: 45,
    timestamp: "2 hours ago",
    category: "Dresses",
  },
  // ... other posts
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appTheme, isDark } = useTheme(); // ✅ Use ThemeContext
  const colors = appTheme.colors;

  // States
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [followedShops, setFollowedShops] = useState<string[]>([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [shopActionsModalVisible, setShopActionsModalVisible] =
    useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Animation refs
  const slideAnim = useRef(new Animated.Value(height)).current;
  const shopActionsSlideAnim = useRef(new Animated.Value(height)).current;

  // Mock comments
  const [comments, setComments] = useState<{ [key: string]: any }>({
    "1": [
      {
        id: "1",
        user: "fashion_lover",
        userAvatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80",
        text: "This dress looks amazing! Can I try it in blue?",
        time: "2h ago",
        likes: 12,
      },
    ],
  });

  // Handlers
  const handleLikePost = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleFollowShop = (shopName: string) => {
    setFollowedShops((prev) =>
      prev.includes(shopName)
        ? prev.filter((name) => name !== shopName)
        : [...prev, shopName]
    );
  };

  const openComments = (postId: string) => {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeComments = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCommentsModalVisible(false);
      setSelectedPostId(null);
      setCommentText("");
    });
  };

  const openShopActions = (postId: string) => {
    setSelectedPostId(postId);
    setShopActionsModalVisible(true);
    Animated.timing(shopActionsSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeShopActions = () => {
    Animated.timing(shopActionsSlideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShopActionsModalVisible(false);
      setSelectedPostId(null);
    });
  };

  const handleAddComment = () => {
    if (commentText.trim() && selectedPostId) {
      const newComment = {
        id: Date.now().toString(),
        user: "you",
        userAvatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        text: commentText.trim(),
        time: "Just now",
        likes: 0,
      };
      setComments((prev) => ({
        ...prev,
        [selectedPostId]: [newComment, ...(prev[selectedPostId] || [])],
      }));
      setCommentText("");
    }
  };

  const selectedPost = selectedPostId
    ? shopPosts.find((post) => post.id === selectedPostId)
    : null;
  const postComments = selectedPostId ? comments[selectedPostId] || [] : [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <HomeHeader insets={insets} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <QuickActions />

        <View style={styles.feedSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Latest from Shops
          </Text>

          {shopPosts.map((post) => (
            <ShopPostCard
              key={post.id}
              post={post}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
              onLikePress={handleLikePost}
              onSavePress={handleSavePost}
              onCommentPress={openComments}
              onShopActionsPress={openShopActions}
              onTryItPress={(postId) => router.push(`/try-on/${postId}`)}
            />
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modals */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={closeComments}
        comments={postComments}
        commentText={commentText}
        setCommentText={setCommentText}
        onAddComment={handleAddComment}
        slideAnim={slideAnim}
      />

      <ShopActionsModal
        visible={shopActionsModalVisible}
        onClose={closeShopActions}
        shop={selectedPost || null}
        followedShops={followedShops}
        onFollowShop={handleFollowShop}
        onSavePost={() => selectedPostId && handleSavePost(selectedPostId)}
        onTryItPress={() =>
          selectedPostId && router.push(`/try-on/${selectedPostId}`)
        }
        slideAnim={shopActionsSlideAnim}
      />
    </SafeAreaView>
  );
}
