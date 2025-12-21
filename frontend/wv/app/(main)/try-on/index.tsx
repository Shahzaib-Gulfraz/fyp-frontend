import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  Share,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Scan,
  Save,
  Sliders,
  RotateCw,
  Camera,
  User,
  Zap,
  ChevronRight,
  Check,
  RefreshCw,
  Share2,
  Heart,
  ShoppingBag,
  Star,
  Maximize2,
  Minimize2,
  Grid,
  RotateCcw,
  X,
  Plus,
  Minus,
  Camera as CameraIcon,
  MessageCircle,
  Bookmark,
} from "lucide-react-native";
import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  SlideInRight,
  SlideInDown,
} from "react-native-reanimated";
import { Platform } from "react-native";


const { width } = Dimensions.get("window");

export default function AvatarScreen() {
  const [hasAvatar, setHasAvatar] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "ar">("3d");
  const [selectedClothing, setSelectedClothing] = useState<any>(null);
  const [tryOnHistory, setTryOnHistory] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  // Mock data for saved items
  const savedItems = [
    {
      id: "1",
      name: "Black Evening Dress",
      brand: "Zara",
      price: "$89.99",
      originalPrice: "$129.99",
      discount: "30%",
      rating: 4.8,
      reviews: 245,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
      category: "Dresses",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black", "Red", "Navy"],
      isLiked: true,
    },
    {
      id: "2",
      name: "Denim Jacket",
      brand: "Levi's",
      price: "$69.99",
      originalPrice: "$99.99",
      discount: "30%",
      rating: 4.6,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      category: "Jackets",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Black", "White"],
      isLiked: true,
    },
    {
      id: "3",
      name: "White Sneakers",
      brand: "Nike",
      price: "$129.99",
      originalPrice: "$159.99",
      discount: "19%",
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
      category: "Shoes",
      sizes: ["40", "41", "42", "43"],
      colors: ["White", "Black"],
      isLiked: true,
    },
    {
      id: "4",
      name: "Summer Floral Dress",
      brand: "H&M",
      price: "$59.99",
      originalPrice: "$79.99",
      discount: "25%",
      rating: 4.5,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
      category: "Dresses",
      sizes: ["XS", "S", "M"],
      colors: ["Multi", "Pink", "Blue"],
      isLiked: true,
    },
  ];

  // Mock data for current try-on (default)
  const currentTryOn = {
    id: "current1",
    name: "Casual Blazer",
    brand: "Hugo Boss",
    price: "$199.99",
    originalPrice: "$299.99",
    discount: "33%",
    rating: 4.7,
    reviews: 421,
    description: "Modern fit blazer with premium wool blend. Perfect for both casual and formal occasions.",
    materials: "Wool 80%, Polyester 20%",
    care: "Dry clean only",
    shipping: "Free shipping & returns",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
    category: "Blazers",
    sizes: ["38", "40", "42", "44"],
    colors: ["Navy", "Black", "Gray"],
    isLiked: false,
  };

  // Try-on history
  const mockTryOnHistory = [
    {
      id: "h1",
      name: "Leather Jacket",
      brand: "AllSaints",
      price: "$349.99",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      date: "Yesterday",
      liked: true,
    },
    {
      id: "h2",
      name: "Silk Dress",
      brand: "Reformation",
      price: "$189.99",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80",
      date: "2 days ago",
      liked: false,
    },
    {
      id: "h3",
      name: "Sneakers",
      brand: "Adidas",
      price: "$89.99",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
      date: "1 week ago",
      liked: true,
    },
  ];

  // Filters for AR mode
  const filters = [
    { id: "none", name: "None", icon: "👁️" },
    { id: "studio", name: "Studio", icon: "🎬" },
    { id: "outdoor", name: "Outdoor", icon: "🌳" },
    { id: "night", name: "Night", icon: "🌙" },
    { id: "warm", name: "Warm", icon: "☀️" },
    { id: "cool", name: "Cool", icon: "❄️" },
  ];

  const handleTryOnItem = (item: any) => {
    setSelectedClothing(item);
    Alert.alert("Trying On", `Now trying on ${item.name} by ${item.brand}`);
  };

  const handleSaveTryOn = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? "Unsaved" : "Saved",
      isSaved
        ? "Removed from saved try-ons"
        : "Saved to your try-on history"
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out how I look in this ${selectedClothing?.name || currentTryOn.name} from ${selectedClothing?.brand || currentTryOn.brand}! #WearVirtually #VirtualTryOn`,
        url: 'https://wearvirtually.com',
        title: 'My Virtual Try-On',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
          console.log('Shared with', result.activityType);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleBuyNow = () => {
    Alert.alert(
      "Purchase",
      `Redirecting to purchase ${selectedClothing?.name || currentTryOn.name}...`
    );
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 15);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 15);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleApplyFilter = (filterId: string) => {
    setCurrentFilter(filterId === "none" ? null : filterId);
  };

  if (!hasAvatar) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <LinearGradient
          colors={["#FFFFFF", "#F8F9FA"]}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Your Avatar</Text>
            <Text style={styles.headerSubtitle}>Your digital twin for virtual try-ons</Text>
          </View>

          {/* Create Avatar Flow (Same as before but simplified) */}
          <ScrollView
            contentContainerStyle={styles.emptyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ... (Keep the same create avatar UI as before) ... */}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentItem = selectedClothing || currentTryOn;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Virtual Try-On</Text>
            <Text style={styles.headerSubtitle}>
              See how clothes fit before buying
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share2 size={20} color="#7B61FF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* View Mode Toggle */}
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === "3d" && styles.viewModeButtonActive]}
              onPress={() => setViewMode("3d")}
            >
              <Grid size={20} color={viewMode === "3d" ? "#FFFFFF" : "#666666"} />
              <Text style={[styles.viewModeText, viewMode === "3d" && styles.viewModeTextActive]}>
                3D View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === "ar" && styles.viewModeButtonActive]}
              onPress={() => setViewMode("ar")}
            >
              <CameraIcon size={20} color={viewMode === "ar" ? "#FFFFFF" : "#666666"} />
              <Text style={[styles.viewModeText, viewMode === "ar" && styles.viewModeTextActive]}>
                AR Mode
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3D/AR Preview */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.previewContainer}
          >
            <LinearGradient
              colors={viewMode === "ar" ? ["#2C3E50", "#4A6491"] : ["#667eea", "#764ba2"]}
              style={styles.previewArea}
            >
              {/* Avatar with Clothing */}
              <View style={[
                styles.avatarWithClothing,
                {
                  transform: [
                    { scale: zoomLevel },
                    { rotate: `${rotation}deg` }
                  ]
                }
              ]}>
                <View style={styles.avatarSilhouette}>
                  <User size={100} color="#FFFFFF" />
                </View>

                {/* Clothing overlay */}
                <Image
                  source={{ uri: currentItem.image }}
                  style={styles.clothingOverlay}
                  resizeMode="contain"
                />
              </View>

              {/* Controls */}
              <View style={styles.controlsContainer}>
                <View style={styles.zoomControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
                    <Minus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.controlText}>Zoom</Text>
                  <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.rotationControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={handleRotateLeft}>
                    <RotateCcw size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.controlText}>Rotate</Text>
                  <TouchableOpacity style={styles.controlButton} onPress={handleRotateRight}>
                    <RotateCw size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={handleResetView}>
                  <RefreshCw size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* AR Filters (only in AR mode) */}
              {viewMode === "ar" && (
                <View style={styles.filtersContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filters.map(filter => (
                      <TouchableOpacity
                        key={filter.id}
                        style={[
                          styles.filterButton,
                          currentFilter === filter.id && styles.filterButtonActive
                        ]}
                        onPress={() => handleApplyFilter(filter.id)}
                      >
                        <Text style={styles.filterIcon}>{filter.icon}</Text>
                        <Text style={[
                          styles.filterText,
                          currentFilter === filter.id && styles.filterTextActive
                        ]}>
                          {filter.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Current Clothing Info */}
          <Animated.View
            entering={SlideInRight.duration(600).delay(200)}
            style={styles.clothingInfo}
          >
            <View style={styles.clothingHeader}>
              <View style={styles.clothingTitleSection}>
                <Text style={styles.clothingBrand}>{currentItem.brand}</Text>
                <Text style={styles.clothingName}>{currentItem.name}</Text>
              </View>

              <TouchableOpacity onPress={handleSaveTryOn}>
                <Heart
                  size={24}
                  color={isSaved ? "#FF6B8B" : "#666666"}
                  fill={isSaved ? "#FF6B8B" : "none"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.priceSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>{currentItem.price}</Text>
                {currentItem.originalPrice && (
                  <Text style={styles.originalPrice}>{currentItem.originalPrice}</Text>
                )}
                {currentItem.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{currentItem.discount} OFF</Text>
                  </View>
                )}
              </View>

              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{currentItem.rating}</Text>
                <Text style={styles.reviewsText}>({currentItem.reviews} reviews)</Text>
              </View>
            </View>

            <Text style={styles.description}>{currentItem.description}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Materials</Text>
                <Text style={styles.detailValue}>{currentItem.materials}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Care</Text>
                <Text style={styles.detailValue}>{currentItem.care}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Shipping</Text>
                <Text style={styles.detailValue}>{currentItem.shipping}</Text>
              </View>
            </View>

            {/* Size & Color Selection */}
            <View style={styles.selectionSection}>
              <View style={styles.sizesContainer}>
                <Text style={styles.selectionTitle}>Size</Text>
                <View style={styles.sizesList}>
                  {currentItem.sizes.map((size: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.sizeButton, index === 0 && styles.sizeButtonActive]}
                    >
                      <Text style={[
                        styles.sizeText,
                        index === 0 && styles.sizeTextActive
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.colorsContainer}>
                <Text style={styles.selectionTitle}>Color</Text>
                <View style={styles.colorsList}>
                  {currentItem.colors.map((color: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.colorButton, index === 0 && styles.colorButtonActive]}
                    >
                      <View style={[
                        styles.colorCircle,
                        { backgroundColor: color.toLowerCase() }
                      ]} />
                      <Text style={styles.colorText}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
                <ShoppingBag size={20} color="#FFFFFF" />
                <Text style={styles.buyButtonText}>Buy Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTryOn}>
                <Bookmark size={20} color="#7B61FF" />
                <Text style={styles.saveButtonText}>
                  {isSaved ? "Saved" : "Save Try-On"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Saved Items for Try-On */}
          <Animated.View
            entering={SlideInDown.duration(600).delay(400)}
            style={styles.savedItemsSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved for Try-On</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={savedItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.savedItemsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.savedItemCard}
                  onPress={() => handleTryOnItem(item)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.savedItemImage}
                    resizeMode="cover"
                  />

                  <View style={styles.savedItemInfo}>
                    <Text style={styles.savedItemBrand} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <Text style={styles.savedItemName} numberOfLines={1}>
                      {item.name}
                    </Text>

                    <View style={styles.savedItemPrice}>
                      <Text style={styles.savedItemCurrentPrice}>{item.price}</Text>
                      {item.originalPrice && (
                        <Text style={styles.savedItemOriginalPrice}>{item.originalPrice}</Text>
                      )}
                    </View>

                    <View style={styles.savedItemRating}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.savedItemRatingText}>{item.rating}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.tryOnButton}
                    onPress={() => handleTryOnItem(item)}
                  >
                    <Zap size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </Animated.View>

          {/* Try-On History */}
          <Animated.View
            entering={SlideInRight.duration(600).delay(600)}
            style={styles.historySection}
          >
            <Text style={styles.sectionTitle}>Recent Try-Ons</Text>
            {mockTryOnHistory.map(item => (
              <TouchableOpacity key={item.id} style={styles.historyItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.historyImage}
                />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{item.name}</Text>
                  <Text style={styles.historyBrand}>{item.brand}</Text>
                  <Text style={styles.historyPrice}>{item.price}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <TouchableOpacity
                  style={styles.historyAction}
                  onPress={() => handleTryOnItem(item)}
                >
                  <RotateCw size={18} color="#7B61FF" />
                  <Text style={styles.historyActionText}>Try Again</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingBottom: 40,
  },
  viewModeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    gap: 10,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: "#7B61FF",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",

    ...(Platform.OS === "web"
      ? {
        boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
      }
      : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }),
  },

  previewArea: {
    padding: 20,
  },
  avatarWithClothing: {
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarSilhouette: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  clothingOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  zoomControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rotationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    minWidth: 50,
    textAlign: "center",
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    marginTop: 15,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "rgba(123, 97, 255, 0.8)",
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  clothingInfo: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  clothingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  clothingTitleSection: {
    flex: 1,
  },
  clothingBrand: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
    marginBottom: 4,
  },
  clothingName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 30,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  originalPrice: {
    fontSize: 18,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#FF6B8B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: "#666666",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  selectionSection: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  sizesContainer: {
    marginBottom: 20,
  },
  sizesList: {
    flexDirection: "row",
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sizeButtonActive: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  sizeTextActive: {
    color: "#FFFFFF",
  },
  colorsContainer: {
    marginBottom: 20,
  },
  colorsList: {
    flexDirection: "row",
    gap: 12,
  },
  colorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 8,
  },
  colorButtonActive: {
    backgroundColor: "#F5F5FF",
    borderColor: "#7B61FF",
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  buyButton: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5FF",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B61FF",
  },
  savedItemsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 14,
    color: "#7B61FF",
    fontWeight: "600",
  },
  savedItemsList: {
    paddingRight: 20,
  },
  savedItemCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
    position: "relative",
  },
  savedItemImage: {
    width: "100%",
    height: 120,
  },
  savedItemInfo: {
    padding: 12,
  },
  savedItemBrand: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  savedItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  savedItemPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  savedItemCurrentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  savedItemOriginalPrice: {
    fontSize: 12,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  savedItemRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  savedItemRatingText: {
    fontSize: 12,
    color: "#666666",
  },
  tryOnButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  historyBrand: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#999999",
  },
  historyAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  historyActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7B61FF",
  },
});