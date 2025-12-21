import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Heart, Trash2, ShoppingBag, X, Check } from "lucide-react-native";
import { useState } from "react";

const { width } = Dimensions.get("window");

export default function SavedItemsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([
    {
      id: "1",
      name: "Black Evening Dress",
      shop: "Fashionista Boutique",
      price: "$89.99",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
      size: "M",
      color: "Black",
      savedDate: "Today",
    },
    {
      id: "2",
      name: "Denim Jacket",
      shop: "Urban Threads",
      price: "$69.99",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      size: "L",
      color: "Blue",
      savedDate: "Yesterday",
    },
    {
      id: "3",
      name: "White Sneakers",
      shop: "Sporty Style",
      price: "$129.99",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
      size: "42",
      color: "White",
      savedDate: "2 days ago",
    },
    {
      id: "4",
      name: "Summer Floral Dress",
      shop: "Floral Dreams",
      price: "$59.99",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
      size: "S",
      color: "Multi",
      savedDate: "3 days ago",
    },
    {
      id: "5",
      name: "Leather Handbag",
      shop: "Luxe Accessories",
      price: "$149.99",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
      size: "One Size",
      color: "Brown",
      savedDate: "1 week ago",
    },
    {
      id: "6",
      name: "Silk Scarf",
      shop: "Elegant Touch",
      price: "$34.99",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      size: "One Size",
      color: "Red",
      savedDate: "1 week ago",
    },
  ]);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = () => {
    setSavedItems(savedItems.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const renderSavedItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => handleSelectItem(item.id)}
      >
        <View style={[
          styles.checkbox,
          selectedItems.includes(item.id) && styles.checkboxSelected
        ]}>
          {selectedItems.includes(item.id) && (
            <Check size={14} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
      />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemShop}>{item.shop}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemDetail}>Size: {item.size}</Text>
          <Text style={styles.itemDetail}>Color: {item.color}</Text>
        </View>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.savedDate}>Saved {item.savedDate}</Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/try-on/${item.id}`)}
        >
          <ShoppingBag size={18} color="#7B61FF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            if (isSelecting) {
              handleSelectItem(item.id);
            } else {
              setSavedItems(savedItems.filter(savedItem => savedItem.id !== item.id));
            }
          }}
        >
          <Trash2 size={18} color="#FF6B8B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Saved Items</Text>
              <Text style={styles.subtitle}>{savedItems.length} items saved</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {isSelecting ? (
              <>
                {selectedItems.length > 0 && (
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleDeleteSelected}
                  >
                    <Trash2 size={22} color="#FF6B8B" />
                    <Text style={styles.headerButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleClearSelection}
                >
                  <X size={22} color="#666666" />
                  <Text style={styles.headerButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              savedItems.length > 0 && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setIsSelecting(true)}
                >
                  <Text style={styles.headerButtonText}>Select</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>

      {savedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyHeart}>
            <Heart size={64} color="#E0E0E0" />
          </View>
          <Text style={styles.emptyTitle}>No saved items yet</Text>
          <Text style={styles.emptyText}>
            Items you save will appear here. Start exploring and save your favorite outfits!
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push("/(main)/home")}
          >
            <Text style={styles.exploreButtonText}>Explore Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>All Saved Items</Text>
            {isSelecting && selectedItems.length > 0 && (
              <Text style={styles.selectedCount}>
                {selectedItems.length} selected
              </Text>
            )}
          </View>

          <FlatList
            data={savedItems}
            renderItem={renderSavedItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.footerTips}>
            <View style={styles.tipCard}>
              <Heart size={20} color="#7B61FF" />
              <Text style={styles.tipText}>
                Tap the heart icon on any item to save it here
              </Text>
            </View>
            <View style={styles.tipCard}>
              <ShoppingBag size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Use the bag icon to quickly shop or try on saved items
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  selectedCount: {
    fontSize: 14,
    color: "#7B61FF",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
    gap: 12,
  },
  selectButton: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  itemShop: {
    fontSize: 14,
    color: "#666666",
  },
  itemDetails: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: "#999999",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 4,
  },
  savedDate: {
    fontSize: 12,
    color: "#999999",
  },
  itemActions: {
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyHeart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footerTips: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});