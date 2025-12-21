import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function ShopScreen() {
  interface Product {
    id: string | number;
    image_url: string;
    name: string;
    fabric: string;
    fit_type: string;
    price: string;
  }

  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== "All")
          params.append("category", selectedCategory);
        if (searchQuery) params.append("search", searchQuery);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  if (!fontsLoaded) {
    return null;
  }

  const categories = [
    "All",
    "Dresses",
    "Tops",
    "Pants",
    "Shoes",
    "Accessories",
  ];

  const filteredProducts = products;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333333" : "#F0F0F0",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
            marginBottom: 16,
          }}
        >
          Shop
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1E1E1E" : "#F6F6F6",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Search size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333333" : "#F0F0F0",
        }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 12,
              backgroundColor:
                selectedCategory === category
                  ? "#ff6b00"
                  : isDark
                    ? "#1E1E1E"
                    : "#F6F6F6",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color:
                  selectedCategory === category
                    ? "#FFFFFF"
                    : isDark
                      ? "#FFFFFF"
                      : "#000000",
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Loading products...
          </Text>
        ) : filteredProducts.length === 0 ? (
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No products found
          </Text>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -6,
            }}
          >
            {filteredProducts.map((product) => (
              <View
                key={product.id}
                style={{
                  width: "48%",
                  marginHorizontal: "1%",
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(tabs)/shop/product/${product.id}`)
                  }
                  style={{
                    borderRadius: 16,
                    backgroundColor: isDark ? "#1E1E1E" : "#F6F6F6",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: product.image_url }}
                    style={{
                      width: "100%",
                      height: 200,
                    }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Heart size={18} color="#000000" />
                  </TouchableOpacity>
                  <View style={{ padding: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: isDark ? "#FFFFFF" : "#000000",
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#9CA3AF" : "#6B7280",
                        marginBottom: 8,
                      }}
                    >
                      {product.fabric} • {product.fit_type}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: "#ff6b00",
                      }}
                    >
                      ${parseFloat(product.price).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}



