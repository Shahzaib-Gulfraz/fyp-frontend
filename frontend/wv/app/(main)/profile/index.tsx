import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Grid, ShoppingBag, Bookmark, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import postService from "@/src/api/postService";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileInfo } from "./components/ProfileInfo";
import { ActionButtons } from "./components/ActionButtons";
import { ProfileTabs } from "./components/ProfileTabs";
import { ProfileContentArea } from "./components/ProfileContentArea";

// Sample user posts data
const userPosts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    likes: 125,
    comments: 12,
    caption: "Trying this summer dress with my new avatar!",
    date: "2 hours ago",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
    likes: 89,
    comments: 8,
    caption: "Virtual fitting for the office look",
    date: "1 day ago",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
    likes: 256,
    comments: 24,
    caption: "Casual weekend vibes in the virtual studio",
    date: "3 days ago",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    likes: 178,
    comments: 15,
    caption: "Evening gown preview for the event",
    date: "1 week ago",
  },
];

export default function ProfileScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, refreshProfile, isLoading } = useUser();
  const styles = getStyles(theme.colors);

  const [activeTab, setActiveTab] = useState("posts");
  const [actualUserPosts, setActualUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasPosts, setHasPosts] = useState(false);

  // Saved items state
  const [savedItems, setSavedItems] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    refreshProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Empty dependency array - run only once on mount

  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) {
        console.log('No user ID found:', user);
        return;
      }

      try {
        setPostsLoading(true);
        console.log('Fetching posts for user:', user.id);
        const response = await postService.getUserPosts(user.id);
        console.log('Posts response:', response);
        console.log('Posts array:', response.data?.posts);
        setActualUserPosts(response.data?.posts || []);
        setHasPosts((response.data?.posts || []).length > 0);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
        setActualUserPosts([]);
        setHasPosts(false);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.id]);

  // Fetch saved items when tab changes to saved
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user?.id || activeTab !== 'saved') {
        console.log('Skipping saved items fetch. User ID:', user?.id, 'Active tab:', activeTab);
        return;
      }

      try {
        setSavedLoading(true);
        console.log('🔍 Fetching saved items for user:', user.id);
        const savedItemService = require('@/src/api/savedItemService').default;
        const response = await savedItemService.getSavedItems();
        console.log('📦 Saved items full response:', response);
        console.log('📦 Response.data:', response.data);
        console.log('📦 Response.data.data:', response.data?.data);
        console.log('📦 Saved items count:', response.data?.data?.length || 0);
        // Backend returns data in response.data.data, not response.data.savedItems
        setSavedItems(response.data?.data || []);
      } catch (error) {
        console.error('❌ Failed to fetch saved items:', error);
        setSavedItems([]);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSavedItems();
  }, [user?.id, activeTab]);

  const tabs = [
    { id: "posts", label: "Posts", icon: <Grid size={20} color={activeTab === 'posts' ? '#00BCD4' : '#999'} /> },
    { id: "saved", label: "Saved", icon: <Bookmark size={20} color={activeTab === 'saved' ? '#00BCD4' : '#999'} /> },
    { id: "activity", label: "Activity", icon: <TrendingUp size={20} color={activeTab === 'activity' ? '#00BCD4' : '#999'} /> },
  ];

  if (!user && isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ProfileHeader
        theme={theme}
        toggleTheme={toggleTheme}
        isDark={isDark}
        username={user.username}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileInfo
          theme={theme}
          user={user}
          userPosts={actualUserPosts}
          fadeAnim={fadeAnim}
          scaleAnim={scaleAnim}
        />

        <ActionButtons theme={theme} />

        <ProfileTabs
          theme={theme}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {postsLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <ProfileContentArea
            theme={theme}
            activeTab={activeTab}
            userPosts={actualUserPosts}
            hasPosts={hasPosts}
            savedItems={savedItems}
            savedLoading={savedLoading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 30,
    },
  });
