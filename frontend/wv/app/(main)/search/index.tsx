import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Search as SearchIcon,
  Grid,
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  User,
  MapPin,
  Calendar,
} from "lucide-react-native";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 4) / COLUMN_COUNT; // Account for 2px gap

// Mock data for search results
const mockProducts = [
  {
    id: "1",
    type: "image", // 'image' or 'video'
    mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
    shopName: "Fashionista Boutique",
    shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    likes: 245,
    comments: 34,
    isVideo: false,
  },
  {
    id: "2",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
    shopName: "Urban Threads",
    shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=100&q=80",
    likes: 189,
    comments: 21,
    isVideo: false,
  },
  {
    id: "3",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80",
    shopName: "Casual Comfort Co.",
    shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=100&q=80",
    likes: 312,
    comments: 45,
    isVideo: true,
  },
  {
    id: "4",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
    shopName: "Luxe Apparel",
    shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    likes: 156,
    comments: 12,
    isVideo: false,
  },
  {
    id: "5",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
    shopName: "Sporty Style",
    shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    likes: 89,
    comments: 8,
    isVideo: false,
  },
  {
    id: "6",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
    shopName: "Luxe Accessories",
    shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=100&q=80",
    likes: 278,
    comments: 32,
    isVideo: true,
  },
  {
    id: "7",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    shopName: "Elegant Touch",
    shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    likes: 134,
    comments: 19,
    isVideo: false,
  },
  {
    id: "8",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
    shopName: "Summer Vibes",
    shopLogo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=100&q=80",
    likes: 201,
    comments: 28,
    isVideo: false,
  },
  {
    id: "9",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
    shopName: "Evening Glam",
    shopLogo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    likes: 167,
    comments: 23,
    isVideo: true,
  },
];

// Mock data for top shops
const topShops = [
  {
    id: "s1",
    name: "Fashionista Boutique",
    logo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    followers: "12.5k",
    posts: 45,
    isFollowing: true,
  },
  {
    id: "s2",
    name: "Urban Threads",
    logo: "https://images.unsplash.com/photo-1562077981-4d7eafd9955f?w=100&q=80",
    followers: "8.7k",
    posts: 32,
    isFollowing: false,
  },
  {
    id: "s3",
    name: "Luxe Apparel",
    logo: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=100&q=80",
    followers: "15.2k",
    posts: 67,
    isFollowing: true,
  },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(mockProducts);
  const [searchHistory, setSearchHistory] = useState(["Summer dresses", "Denim jackets", "White sneakers"]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "shops" | "products">("all");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults(mockProducts);
    } else {
      // Filter results based on search query
      const filtered = mockProducts.filter(
        item =>
          item.shopName.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      
      // Add to search history if not already present
      if (!searchHistory.includes(query) && query.trim() !== "") {
        setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(mockProducts);
  };

  const removeFromHistory = (item: string) => {
    setSearchHistory(prev => prev.filter(historyItem => historyItem !== item));
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
  };

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image
        source={{ uri: item.mediaUrl }}
        style={styles.gridImage}
        resizeMode="cover"
      />
      
      {/* Video indicator */}
      {item.type === "video" && (
        <View style={styles.videoIndicator}>
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      )}
      
      {/* Engagement stats overlay */}
      <View style={styles.itemOverlay}>
        <View style={styles.engagementStats}>
          <View style={styles.statItem}>
            <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={12} color="#FFFFFF" />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
      
      {/* Shop info mini overlay */}
      <View style={styles.shopInfo}>
        <Image
          source={{ uri: item.shopLogo }}
          style={styles.shopLogoMini}
        />
      </View>
    </TouchableOpacity>
  );

  const renderListSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.listImageContainer}>
        <Image
          source={{ uri: item.mediaUrl }}
          style={styles.listImage}
          resizeMode="cover"
        />
        {item.type === "video" && (
          <View style={styles.listVideoIndicator}>
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        )}
      </View>
      
      <View style={styles.listInfo}>
        <View style={styles.listShopInfo}>
          <Image
            source={{ uri: item.shopLogo }}
            style={styles.listShopLogo}
          />
          <Text style={styles.listShopName}>{item.shopName}</Text>
        </View>
        
        <View style={styles.listStats}>
          <View style={styles.listStat}>
            <Heart size={16} color="#666666" />
            <Text style={styles.listStatText}>{item.likes}</Text>
          </View>
          <View style={styles.listStat}>
            <MessageCircle size={16} color="#666666" />
            <Text style={styles.listStatText}>{item.comments}</Text>
          </View>
        </View>
        
        <View style={styles.listActions}>
          <TouchableOpacity style={styles.listActionButton}>
            <Heart size={18} color="#FF6B8B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listActionButton}>
            <MessageCircle size={18} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listActionButton}>
            <Bookmark size={18} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderShopItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.shopCard}>
      <View style={styles.shopHeader}>
        <Image
          source={{ uri: item.logo }}
          style={styles.shopLogo}
        />
        <View style={styles.shopInfoText}>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopStats}>
            {item.followers} followers • {item.posts} posts
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.followButton, item.isFollowing && styles.followingButton]}
      >
        <Text style={[styles.followButtonText, item.isFollowing && styles.followingButtonText]}>
          {item.isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Search Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <SearchIcon size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search shops, products, or brands..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Toggle view mode */}
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <Ionicons name="list" size={24} color="#666666" />
            ) : (
              <Grid size={24} color="#666666" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search History (when no query) */}
        {searchQuery === "" && searchHistory.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            
            {searchHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <TouchableOpacity
                  style={styles.historyContent}
                  onPress={() => handleSearch(item)}
                >
                  <Ionicons name="time-outline" size={20} color="#666666" />
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFromHistory(item)}
                  style={styles.historyRemove}
                >
                  <Ionicons name="close" size={20} color="#999999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Top Shops Section */}
        {searchQuery === "" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Shops</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.shopsScroll}
              contentContainerStyle={styles.shopsContent}
            >
              {topShops.map(shop => (
                <TouchableOpacity key={shop.id} style={styles.topShopCard}>
                  <Image
                    source={{ uri: shop.logo }}
                    style={styles.topShopLogo}
                  />
                  <Text style={styles.topShopName} numberOfLines={1}>
                    {shop.name}
                  </Text>
                  <Text style={styles.topShopFollowers}>
                    {shop.followers} followers
                  </Text>
                  <TouchableOpacity
                    style={[styles.topShopFollowButton, shop.isFollowing && styles.topShopFollowingButton]}
                  >
                    <Text style={[styles.topShopFollowText, shop.isFollowing && styles.topShopFollowingText]}>
                      {shop.isFollowing ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tabs */}
        {searchQuery !== "" && (
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "all" && styles.activeTab]}
                onPress={() => setActiveTab("all")}
              >
                <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "shops" && styles.activeTab]}
                onPress={() => setActiveTab("shops")}
              >
                <Text style={[styles.tabText, activeTab === "shops" && styles.activeTabText]}>
                  Shops
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "products" && styles.activeTab]}
                onPress={() => setActiveTab("products")}
              >
                <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>
                  Products
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Search Results */}
        {searchQuery !== "" && searchResults.length === 0 ? (
          <View style={styles.noResults}>
            <SearchIcon size={64} color="#E0E0E0" />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsText}>
              Try searching for something else
            </Text>
          </View>
        ) : (
          <>
            {viewMode === "grid" ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={item => item.id}
                numColumns={COLUMN_COUNT}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
              />
            ) : (
              <View style={styles.listContainer}>
                {searchResults.map(item => renderListSearchItem({ item }))}
              </View>
            )}
          </>
        )}

        {/* Recommended Hashtags */}
        {searchQuery === "" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
            <View style={styles.hashtagContainer}>
              {["#summerfashion", "#ootd", "#streetstyle", "#fashiontrends", "#virtualtryon"].map(
                (tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.hashtag}
                    onPress={() => handleSearch(tag)}
                  >
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}

        {/* Bottom padding for footer */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  viewToggle: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  historySection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  clearAllText: {
    fontSize: 14,
    color: "#7B61FF",
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  historyContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
  historyRemove: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  shopsScroll: {
    flexGrow: 0,
  },
  shopsContent: {
    paddingRight: 16,
    gap: 12,
  },
  topShopCard: {
    width: 140,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  topShopLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  topShopName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 4,
  },
  topShopFollowers: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 12,
  },
  topShopFollowButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  topShopFollowingButton: {
    backgroundColor: "#F0F0F0",
  },
  topShopFollowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  topShopFollowingText: {
    color: "#666666",
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  activeTab: {
    backgroundColor: "#000000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  gridContainer: {
    paddingHorizontal: 1, // Half of the gap to center items
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
  },
  videoIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 6,
  },
  engagementStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  shopInfo: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  shopLogoMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  listImageContainer: {
    width: 120,
    height: 120,
    position: "relative",
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listVideoIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: {
    flex: 1,
    padding: 12,
  },
  listShopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  listShopLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  listShopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  listStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  listStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listStatText: {
    fontSize: 14,
    color: "#666666",
  },
  listActions: {
    flexDirection: "row",
    gap: 12,
  },
  listActionButton: {
    padding: 6,
  },
  shopCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  shopLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  shopInfoText: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  shopStats: {
    fontSize: 14,
    color: "#666666",
  },
  followButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "#F0F0F0",
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  followingButtonText: {
    color: "#666666",
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hashtag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hashtagText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
});