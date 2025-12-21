import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Heart, ShoppingBag, User } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fetch product data
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const data = await response.json();
      setProduct(data.product);

      // Set default color if available
      if (data.product.colors && data.product.colors.length > 0) {
        setSelectedColor(data.product.colors[0].name);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading || !product) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ color: isDark ? "#FFFFFF" : "#000000" }}>
          {loading ? "Loading..." : "Product not found"}
        </Text>
      </View>
    );
  }

  const sizes = product.sizes?.map((s) => s.size) || [];
  const colors = product.colors || [];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          backgroundColor: "transparent",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Heart size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <Image
          source={{ uri: product.image_url }}
          style={{
            width: width,
            height: width * 1.2,
          }}
          contentFit="cover"
        />

        {/* Product Info */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_700Bold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 8,
                }}
              >
                {product.name}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: "#ff6b00",
                }}
              >
                ${parseFloat(product.price).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Product Details */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {product.fabric && (
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F6F6F6",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {product.fabric}
                  </Text>
                </View>
              )}
              {product.fit_type && (
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F6F6F6",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {product.fit_type} Fit
                  </Text>
                </View>
              )}
              {product.product_length && (
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F6F6F6",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {product.product_length}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 12,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  lineHeight: 24,
                }}
              >
                {product.description}
              </Text>
            </View>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 12,
                }}
              >
                Select Size
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 10,
                      marginRight: 12,
                      marginBottom: 12,
                      backgroundColor:
                        selectedSize === size
                          ? "#ff6b00"
                          : isDark
                            ? "#1E1E1E"
                            : "#F6F6F6",
                      borderWidth: selectedSize === size ? 0 : 1,
                      borderColor: isDark ? "#333333" : "#E6E6E6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color:
                          selectedSize === size
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                      }}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 12,
                }}
              >
                Select Color
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.name}
                    onPress={() => setSelectedColor(color.name)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 10,
                      marginRight: 12,
                      marginBottom: 12,
                      backgroundColor:
                        selectedColor === color.name
                          ? "#ff6b00"
                          : isDark
                            ? "#1E1E1E"
                            : "#F6F6F6",
                      borderWidth: selectedColor === color.name ? 0 : 1,
                      borderColor: isDark ? "#333333" : "#E6E6E6",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: color.hex,
                        marginRight: 8,
                        borderWidth: color.hex === "#FFFFFF" ? 1 : 0,
                        borderColor: "#E6E6E6",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color:
                          selectedColor === color.name
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#000000",
                      }}
                    >
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#333333" : "#E6E6E6",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/avatar")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "#2D1A0E" : "#FFF5F0",
            paddingVertical: 16,
            borderRadius: 12,
            marginRight: 12,
            borderWidth: 1,
            borderColor: "#ff6b00",
          }}
        >
          <User size={20} color="#ff6b00" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#ff6b00",
            }}
          >
            Try On
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ff6b00",
            paddingVertical: 16,
            borderRadius: 12,
          }}
        >
          <ShoppingBag size={20} color="#FFFFFF" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            Add to Bag
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



