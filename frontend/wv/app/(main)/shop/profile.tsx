// app/(main)/shop/profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";

const { width } = Dimensions.get("window");

type ShopPost = {
  id: string;
  image: string;
  likes: number;
  comments: number;
  shares: number;
  type: "image" | "product" | "video";
  caption?: string;
  date: string;
};

type ShopLink = {
  id: string;
  title: string;
  url: string;
  icon: string;
};

export default function ShopProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "products" | "reviews">("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Shop data
  const [shopData, setShopData] = useState({
    username: "@fashionhub",
    shopName: "Fashion Hub Boutique",
    description: "Premium fashion store with the latest trends in clothing and accessories. We deliver worldwide!",
    location: "New York, USA",
    email: "contact@fashionhub.com",
    phone: "+1 (555) 123-4567",
    website: "https://fashionhub.com",
    established: "2018",
    category: "Clothing & Apparel",
    followers: 24580,
    following: 342,
    posts: 156,
    rating: 4.7,
  });

  const [shopLinks, setShopLinks] = useState<ShopLink[]>([
    { id: "1", title: "Visit Website", url: "https://fashionhub.com", icon: "globe-outline" },
    { id: "2", title: "WhatsApp Business", url: "https://wa.me/15551234567", icon: "logo-whatsapp" },
    { id: "3", title: "Instagram", url: "https://instagram.com/fashionhub", icon: "logo-instagram" },
    { id: "4", title: "Facebook Page", url: "https://facebook.com/fashionhub", icon: "logo-facebook" },
  ]);

  const [shopPosts, setShopPosts] = useState<ShopPost[]>([
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
      likes: 2450,
      comments: 89,
      shares: 45,
      type: "product",
      caption: "New Collection Just Dropped! 🔥",
      date: "2024-01-15",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w-400",
      likes: 1890,
      comments: 67,
      shares: 32,
      type: "image",
      caption: "Behind the scenes at our photoshoot ✨",
      date: "2024-01-14",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400",
      likes: 3120,
      comments: 124,
      shares: 78,
      type: "video",
      caption: "Virtual try-on demo! 👗",
      date: "2024-01-13",
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
      likes: 1780,
      comments: 45,
      shares: 21,
      type: "product",
      caption: "Limited Edition Pieces 🎁",
      date: "2024-01-12",
    },
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
      likes: 890,
      comments: 23,
      shares: 12,
      type: "image",
      caption: "Customer Reviews 📝",
      date: "2024-01-11",
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400",
      likes: 1450,
      comments: 56,
      shares: 34,
      type: "video",
      caption: "How to style our new collection",
      date: "2024-01-10",
    },
  ]);

  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800");
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setShopData(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  const pickBannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBannerImage(result.assets[0].uri);
    }
  };

  const pickProfileImage = async () => {
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

  const handleShareProfile = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync({
        message: `Check out ${shopData.shopName}'s profile on Virtual Fashion Store: https://vfs.com/shop/${shopData.username}`,
        url: 'https://vfs.com',
        title: `Share ${shopData.shopName}`,
      });
    } else {
      Alert.alert("Sharing not available", "Sharing is not available on this device");
    }
    setShowShareOptions(false);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    Alert.alert("Success", "Profile updated successfully");
    setShowEditProfile(false);
  };

  const navigateToDashboard = () => {
    router.push("/(main)/shop/dashboard");
  };

  const navigateToStaff = () => {
    router.push("/(main)/shop/staff");
  };

  const navigateToSettings = () => {
    router.push("/(main)/shop/settings");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.username}>{shopData.username}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIcon} onPress={navigateToDashboard}>
          <Ionicons name="grid-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={navigateToStaff}>
          <Ionicons name="people-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={navigateToSettings}>
          <Ionicons name="settings-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBannerAndProfile = () => (
    <View style={styles.bannerSection}>
      {/* Banner Image */}
      <TouchableOpacity onPress={pickBannerImage} style={styles.bannerContainer}>
        <Image 
          source={{ uri: bannerImage }} 
          style={styles.bannerImage} 
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickProfileImage} style={styles.profileImageWrapper}>
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <View style={styles.profileImageOverlay}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{shopData.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{shopData.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{shopData.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.followButton, isFollowing && styles.followingButton]} 
        onPress={handleFollowToggle}
      >
        <Ionicons 
          name={isFollowing ? "checkmark" : "add-outline"} 
          size={20} 
          color={isFollowing ? "#FFFFFF" : "#1A1A1A"} 
        />
        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderShopInfo = () => (
    <View style={styles.infoSection}>
      <Text style={styles.shopName}>{shopData.shopName}</Text>
      
      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{shopData.rating}</Text>
        <Text style={styles.ratingCount}>({Math.floor(shopData.followers * 0.1)} reviews)</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{shopData.description}</Text>

      {/* Shop Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={18} color="#666666" />
          <Text style={styles.detailText}>{shopData.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={18} color="#666666" />
          <Text style={styles.detailText}>Est. {shopData.established}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="pricetag-outline" size={18} color="#666666" />
          <Text style={styles.detailText}>{shopData.category}</Text>
        </View>
      </View>

      {/* Links */}
      <View style={styles.linksContainer}>
        {shopLinks.map((link) => (
          <TouchableOpacity key={link.id} style={styles.linkButton}>
            <Ionicons name={link.icon as any} size={16} color="#7B61FF" />
            <Text style={styles.linkText}>{link.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <TouchableOpacity style={styles.contactItem}>
          <Ionicons name="mail-outline" size={18} color="#666666" />
          <Text style={styles.contactText}>{shopData.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactItem}>
          <Ionicons name="call-outline" size={18} color="#666666" />
          <Text style={styles.contactText}>{shopData.phone}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={handleEditProfile}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={() => setShowShareOptions(true)}
      >
        <Ionicons name="share-outline" size={20} color="#7B61FF" />
        <Text style={styles.shareButtonText}>Share Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPosts = () => (
    <View style={styles.postsSection}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <Text style={[styles.tabText, activeTab === "posts" && styles.activeTabText]}>
            Posts ({shopPosts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>
            Products (45)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
          onPress={() => setActiveTab("reviews")}
        >
          <Text style={[styles.tabText, activeTab === "reviews" && styles.activeTabText]}>
            Reviews (89)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <FlatList
        data={shopPosts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.postsGrid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.postItem}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.postImage} 
              resizeMode="cover"
            />
            <View style={styles.postOverlay}>
              {item.type === "video" && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.postStats}>
                <View style={styles.postStat}>
                  <Ionicons name="heart" size={14} color="#FFFFFF" />
                  <Text style={styles.postStatText}>{item.likes > 1000 ? `${(item.likes/1000).toFixed(1)}k` : item.likes}</Text>
                </View>
                <View style={styles.postStat}>
                  <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                  <Text style={styles.postStatText}>{item.comments}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfile}
      animationType="slide"
      transparent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Shop Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Name</Text>
              <TextInput
                style={styles.input}
                value={shopData.shopName}
                onChangeText={(text) => setShopData(prev => ({ ...prev, shopName: text }))}
                placeholder="Enter shop name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={shopData.username}
                onChangeText={(text) => setShopData(prev => ({ ...prev, username: text }))}
                placeholder="Enter username"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shopData.description}
                onChangeText={(text) => setShopData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your shop"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={shopData.location}
                onChangeText={(text) => setShopData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={shopData.email}
                onChangeText={(text) => setShopData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={shopData.phone}
                onChangeText={(text) => setShopData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={shopData.website}
                onChangeText={(text) => setShopData(prev => ({ ...prev, website: text }))}
                placeholder="Enter website URL"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderShareOptionsModal = () => (
    <Modal
      visible={showShareOptions}
      animationType="slide"
      transparent
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: 300 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Profile</Text>
            <TouchableOpacity onPress={() => setShowShareOptions(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.shareOptions}>
            <TouchableOpacity style={styles.shareOption} onPress={handleShareProfile}>
              <Ionicons name="share-social-outline" size={24} color="#7B61FF" />
              <Text style={styles.shareOptionText}>Share via...</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="copy-outline" size={24} color="#7B61FF" />
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="qr-code-outline" size={24} color="#7B61FF" />
              <Text style={styles.shareOptionText}>QR Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="mail-outline" size={24} color="#7B61FF" />
              <Text style={styles.shareOptionText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="storefront" size={40} color="#000000" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderBannerAndProfile()}
        {renderStats()}
        {renderShopInfo()}
        {renderActionButtons()}
        {renderPosts()}
      </ScrollView>

      {renderEditProfileModal()}
      {renderShareOptionsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
    fontFamily: "Inter_500Medium",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerSection: {
    position: "relative",
    marginBottom: 60,
  },
  bannerContainer: {
    height: 160,
    backgroundColor: "#F8F9FA",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "absolute",
    left: 20,
    bottom: -40,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileImageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E0E0E0",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  followingButton: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },
  followButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
  followingButtonText: {
    color: "#FFFFFF",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  shopName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#666666",
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#7B61FF",
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  actionsSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5FF",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#7B61FF",
  },
  postsSection: {
    paddingHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#7B61FF",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  activeTabText: {
    color: "#7B61FF",
    fontFamily: "Inter_600SemiBold",
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  postItem: {
    width: (width - 40 - 4) / 3,
    height: (width - 40 - 4) / 3,
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 8,
  },
  videoIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  postStats: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    gap: 12,
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  modalBody: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  shareOptions: {
    padding: 24,
    gap: 16,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  shareOptionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
  },
});