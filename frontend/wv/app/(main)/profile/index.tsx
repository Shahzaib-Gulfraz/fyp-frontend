import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Camera,
  Settings,
  Edit3,
  Grid,
  ShoppingBag,
  TrendingUp,
  Sun,
  Moon,
  Mail,
  MapPin,
  Share2,
  ImageIcon as ImageIcon,
  Plus,
  ThumbsUp,
  MessageCircle,
  Bookmark,
} from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../src/context/ThemeContext";

const { width } = Dimensions.get("window");

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
  const styles = getStyles(theme.colors);

  const router = useRouter();
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
  );
  const [activeTab, setActiveTab] = useState("posts");
  const [hasPosts, setHasPosts] = useState(userPosts.length > 0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
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
  }, []);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const tabs = [
    { id: "posts", label: "Posts", icon: <Grid size={20} /> },
    { id: "wardrobe", label: "Wardrobe", icon: <ShoppingBag size={20} /> },
    { id: "saved", label: "Saved", icon: <Bookmark size={20} /> },
    { id: "activity", label: "Activity", icon: <TrendingUp size={20} /> },
  ];

  const renderEmptyPosts = () => (
    <View style={styles.emptyPostsContainer}>
      <View style={styles.emptyIconContainer}>
        <ImageIcon size={64} color="#CCCCCC" />
      </View>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Share your first virtual try-on experience
      </Text>
      <TouchableOpacity style={styles.createPostButton}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.createPostText}>Create First Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostGrid = () => (
    <FlatList
      data={userPosts}
      numColumns={3}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.postItem}>
          <Image
            source={{ uri: item.image }}
            style={styles.postImage}
            contentFit="cover"
          />
          <View style={styles.postOverlay}>
            <View style={styles.postStats}>
              <View style={styles.postStat}>
                <ThumbsUp size={12} color="#FFFFFF" />
                <Text style={styles.postStatText}>{item.likes}</Text>
              </View>
              <View style={styles.postStat}>
                <MessageCircle size={12} color="#FFFFFF" />
                <Text style={styles.postStatText}>{item.comments}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.postsGrid}
      scrollEnabled={false}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerContent}>
          {/* Stylish Username */}
          <View style={styles.usernameContainer}>
            <Text style={styles.usernameStylish}>𝔞𝔩𝔢𝔵𝔧𝔬𝔥𝔫𝔰𝔬𝔫</Text>
          </View>

          {/* Right Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
              {isDark ? (
                <Sun size={22} color={theme.colors.text} />
              ) : (
                <Moon size={22} color={theme.colors.text} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(main)/settings")}
            >
              <Settings size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Profile Image and Basic Info */}
          <View style={styles.profileInfo}>
            <Animated.View
              style={[
                styles.profileImageContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                contentFit="cover"
                transition={300}
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleImagePicker}
              >
                <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.userStats}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>1.2K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>340</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Alex Johnson</Text>
            <Text style={styles.userBio}>
              Fashion enthusiast • Virtual try-on expert • Always shopping for
              the perfect fit 👗
            </Text>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={14} color="#666666" />
                <Text style={styles.contactText}>alex@wearvirtually.com</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={14} color="#666666" />
                <Text style={styles.contactText}>New York, USA</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons - Two Equal Size Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/profile/edit")}
            >
              <LinearGradient
                colors={["#00BCD4", "#00ACC1"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Edit3 size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => Alert.alert("Share", "Profile shared!")}
            >
              <Share2 size={18} color="#00BCD4" />
              <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs Navigation */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts/Content Area */}
        <View style={styles.contentArea}>
          {activeTab === "posts" ? (
            hasPosts ? (
              <View style={styles.postsSection}>
                <Text style={styles.sectionTitle}>Your Posts</Text>
                {renderPostGrid()}
              </View>
            ) : (
              renderEmptyPosts()
            )
          ) : activeTab === "wardrobe" ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Virtual Wardrobe</Text>
              <View style={styles.wardrobeGrid}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <TouchableOpacity key={item} style={styles.wardrobeItem}>
                    <Image
                      source={{
                        uri: `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=${item}`,
                      }}
                      style={styles.wardrobeImage}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : activeTab === "saved" ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Saved Items</Text>
              <View style={styles.savedGrid}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <TouchableOpacity key={item} style={styles.savedItem}>
                    <Image
                      source={{
                        uri: `https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=${item}`,
                      }}
                      style={styles.savedImage}
                      contentFit="cover"
                    />
                    <View style={styles.savedIcon}>
                      <Bookmark size={20} color="#00BCD4" fill="#00BCD4" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityList}>
                {[
                  { action: "Liked a post", time: "2 hours ago" },
                  { action: "Followed FashionBrand", time: "1 day ago" },
                  { action: "Saved an outfit", time: "2 days ago" },
                  { action: "Created new avatar", time: "1 week ago" },
                ].map((item, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{item.action}</Text>
                      <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
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
    topHeader: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 10,
      paddingBottom: 15,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    usernameContainer: {
      flex: 1,
    },
    usernameStylish: {
      fontSize: 22,
      fontFamily: "System", // This will show the Unicode bold script
      color: "#000000",
      letterSpacing: 1,
    },
    headerIcons: {
      flexDirection: "row",
      gap: 15,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    // Scroll View
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 30,
    },
    // Profile Header
    profileHeader: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    profileInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    profileImageContainer: {
      position: "relative",
      marginRight: 30,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cameraButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#00BCD4",
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "#FFFFFF",
    },
    userStats: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statColumn: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1A1A1A",
    },
    statLabel: {
      fontSize: 13,
      color: "#666666",
      marginTop: 4,
    },
    userDetails: {
      marginBottom: 25,
    },
    userName: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 6,
    },
    userBio: {
      fontSize: 14,
      color: "#666666",
      lineHeight: 20,
      marginBottom: 15,
    },
    contactInfo: {
      gap: 10,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    contactText: {
      fontSize: 13,
      color: "#666666",
    },
    // Action Buttons
    actionButtonsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 25,
    },
    actionButton: {
      flex: 1,
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    shareButton: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#00BCD4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      gap: 8,
    },
    shareButtonText: {
      color: "#00BCD4",
    },
    // Tabs
    tabsContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
      marginHorizontal: 20,
      marginBottom: 20,
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 8,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTabButton: {
      borderBottomColor: "#00BCD4",
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#999999",
    },
    activeTabLabel: {
      color: "#00BCD4",
    },
    // Content Area
    contentArea: {
      minHeight: 300,
      paddingHorizontal: 20,
    },
    postsSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 20,
    },
    postsGrid: {
      paddingBottom: 20,
    },
    postItem: {
      width: (width - 60) / 3,
      height: (width - 60) / 3,
      margin: 1,
      position: "relative",
    },
    postImage: {
      width: "100%",
      height: "100%",
    },
    postOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "flex-end",
      padding: 8,
    },
    postStats: {
      flexDirection: "row",
      gap: 12,
    },
    postStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    postStatText: {
      fontSize: 11,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    // Empty Posts
    emptyPostsContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: "#666666",
      textAlign: "center",
      marginBottom: 25,
      paddingHorizontal: 40,
      lineHeight: 20,
    },
    createPostButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#00BCD4",
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    createPostText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    // Other Tab Content
    tabContent: {
      flex: 1,
    },
    wardrobeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 2,
    },
    wardrobeItem: {
      width: (width - 44) / 3,
      height: (width - 44) / 3,
    },
    wardrobeImage: {
      width: "100%",
      height: "100%",
    },
    savedGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 2,
    },
    savedItem: {
      width: (width - 44) / 3,
      height: (width - 44) / 3,
      position: "relative",
    },
    savedImage: {
      width: "100%",
      height: "100%",
    },
    savedIcon: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 10,
      padding: 4,
    },
    activityList: {
      gap: 16,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    activityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#00BCD4",
      marginRight: 16,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 15,
      color: "#1A1A1A",
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 13,
      color: "#999999",
    },
  });
