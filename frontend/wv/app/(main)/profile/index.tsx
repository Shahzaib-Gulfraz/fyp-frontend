import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Grid, ShoppingBag, Bookmark, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
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
  const [hasPosts] = useState(userPosts.length > 0);

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
  }, [fadeAnim, refreshProfile, scaleAnim]);

  const tabs = [
    { id: "posts", label: "Posts", icon: <Grid size={20} color={activeTab === 'posts' ? '#00BCD4' : '#999'} /> },
    { id: "wardrobe", label: "Wardrobe", icon: <ShoppingBag size={20} color={activeTab === 'wardrobe' ? '#00BCD4' : '#999'} /> },
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
          userPosts={userPosts}
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

        <ProfileContentArea
          theme={theme}
          activeTab={activeTab}
          userPosts={userPosts}
          hasPosts={hasPosts}
        />
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
