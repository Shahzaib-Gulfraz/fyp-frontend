// app/(main)/social/suggestions.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  UserPlus,
  Check,
  Users,
  TrendingUp,
  MapPin,
  Briefcase,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

const suggestionsData = [
  {
    id: "1",
    name: "Sarah Miller",
    username: "@sarahm",
    bio: "Fashion influencer • Digital creator",
    followers: "12.5K",
    mutualFriends: 8,
    location: "Los Angeles, CA",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80",
  },
  {
    id: "2",
    name: "Michael Chen",
    username: "@michaelc",
    bio: "Tech entrepreneur • Startup founder",
    followers: "8.2K",
    mutualFriends: 12,
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
  {
    id: "3",
    name: "Emma Wilson",
    username: "@emmaw",
    bio: "Sustainable fashion advocate",
    followers: "15.7K",
    mutualFriends: 5,
    location: "Portland, OR",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
  },
  {
    id: "4",
    name: "David Park",
    username: "@davidp",
    bio: "Virtual fashion designer",
    followers: "6.3K",
    mutualFriends: 3,
    location: "Seattle, WA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    username: "@lisar",
    bio: "Fashion blogger • Content creator",
    followers: "21.2K",
    mutualFriends: 15,
    location: "Miami, FL",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
  },
];

export default function SuggestionsScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  const [following, setFollowing] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toggleFollow = (userId: string) => {
    setFollowing(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderSuggestionItem = ({ item }: { item: any }) => {
    const isFollowing = following.includes(item.id);
    
    return (
      <View style={styles.suggestionCard}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>{item.username}</Text>
            <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
            
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Users size={12} color="#666" />
                <Text style={styles.statText}>{item.followers} followers</Text>
              </View>
              {item.mutualFriends > 0 && (
                <View style={styles.statItem}>
                  <TrendingUp size={12} color="#666" />
                  <Text style={styles.statText}>{item.mutualFriends} mutual</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userLocation}>
              <MapPin size={12} color="#666" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={() => toggleFollow(item.id)}
        >
          {isFollowing ? (
            <>
              <Check size={16} color="#00BCD4" />
              <Text style={styles.followingButtonText}>Following</Text>
            </>
          ) : (
            <>
              <UserPlus size={16} color="#FFFFFF" />
              <Text style={styles.followButtonText}>Follow</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Follow Suggestions</Text>
            <Text style={styles.headerSubtitle}>People you may know</Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <FlatList
        data={suggestionsData}
        renderItem={renderSuggestionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Suggestions based on your interests, location, and mutual connections
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Users size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No suggestions available</Text>
            <Text style={styles.emptyText}>
              Follow more people to get better suggestions
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: "#666",
      marginTop: 2,
    },
    listContent: {
      padding: 20,
    },
    infoBox: {
      backgroundColor: "#E0F7FA",
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    infoText: {
      fontSize: 14,
      color: "#006064",
      textAlign: "center",
      lineHeight: 20,
    },
    suggestionCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: "row",
      flex: 1,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 12,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    userUsername: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    userBio: {
      fontSize: 12,
      color: "#666",
      lineHeight: 16,
      marginBottom: 8,
    },
    userStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 6,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 11,
      color: "#666",
    },
    userLocation: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    locationText: {
      fontSize: 11,
      color: "#666",
    },
    followButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#00BCD4",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    followButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    followingButton: {
      backgroundColor: "#E0F7FA",
      borderWidth: 1,
      borderColor: "#00BCD4",
    },
    followingButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#00BCD4",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });