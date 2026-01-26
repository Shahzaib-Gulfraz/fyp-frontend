import React, { useState, useEffect } from "react";
import { ScrollView, Alert, TouchableOpacity, Text, View, ActivityIndicator, Platform, Modal, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from "@/src/context/ThemeContext";
import tryOnService from "@/src/api/tryOnService";
import savedItemService from '@/src/api/savedItemService';
import productService from '@/src/api/productService';
import cartService from '@/src/api/cartService';

import TryOnHeader from "./components/TryOnHeader";
import ClothingInfo from "./components/ClothingInfo";
import ActionButtons from "./components/ActionButtons";
import SavedItemsSection from "./components/SavedItemsSection";
import TryOnHistory from "./components/TryOnHistory";

import { ClothingItem, TryOnHistoryItem } from "./types";
import { Camera, Image as ImageIcon, Sparkles } from "lucide-react-native";

const TryOnScreen = () => {
  const router = useRouter();
  const { product } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  // Initial product from params if available
  const initialProduct = product ? JSON.parse(product as string) : null;

  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(initialProduct);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [historyItems, setHistoryItems] = useState<TryOnHistoryItem[]>([]);

  // Selection state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  const currentItem = selectedClothing;

  // Helper to get image URL safely
  const getGarmentImage = (item: any) => {
    if (item.image) return item.image; // Mock
    if (item.thumbnail?.url) return item.thumbnail.url; // Real product
    if (item.images?.length > 0) return item.images[0].url || item.images[0];
    return null;
  };

  const [savedItems, setSavedItems] = useState<ClothingItem[]>([]);

  const fetchSavedItems = React.useCallback(async () => {
    try {
      const response = await savedItemService.getSavedItems();

      let items: ClothingItem[] = [];

      if (response?.success && response?.data && response.data.length > 0) {
        // Map saved items to ClothingItem
        items = response.data.map((saved: any) => {
          const p = saved.product || saved.productId;
          return {
            id: p._id,
            _id: p._id,
            name: p.name,
            brand: p.brand || 'WearVirtually',
            price: `$${p.price}`,
            image: p.thumbnail?.url || p.images?.[0]?.url || 'https://placehold.co/200x200',
            description: p.description,
            sizes: p.sizes || ['S', 'M', 'L', 'XL'],
            colors: p.colors || ['black', 'white']
          };
        });
      }
      
      // Always fetch products from database
      try {
        const productsResponse = await productService.getProducts({ limit: 10, tryon: true });

        if (productsResponse?.products && productsResponse.products.length > 0) {
          const randomProducts = productsResponse.products.map((p: any) => ({
            id: p._id,
            _id: p._id,
            name: p.name,
            brand: p.brand || 'WearVirtually',
            price: `$${p.price}`,
            image: p.thumbnail?.url || p.images?.[0]?.url || 'https://placehold.co/200x200',
            description: p.description,
            sizes: p.sizes || ['S', 'M', 'L', 'XL'],
            colors: p.colors || ['black', 'white'],
            tryon: p.tryon
          }));
          
          // Combine saved items with random products (avoiding duplicates)
          const savedIds = items.map(i => i.id);
          const uniqueRandomProducts = randomProducts.filter((p: any) => !savedIds.includes(p.id));
          items = [...items, ...uniqueRandomProducts];
        }
      } catch (prodError) {
        console.log("Failed to fetch products:", prodError);
      }

      setSavedItems(items);

      // Auto-select first item if no product was passed via params
      if (!initialProduct && items.length > 0) {
        setSelectedClothing(items[0]);
      }
    } catch (_error) {
      console.log("Failed to fetch saved items", _error);
      setSavedItems([]);
    }
  }, [initialProduct]);

  const fetchHistory = React.useCallback(async () => {
    try {
      const response = await tryOnService.getHistory();
      if (response.success) {
        // Map backend history to UI format
        const formattedHistory = response.data.map((item: any) => ({
          id: item._id,
          name: item.garmentId?.name || 'Try-On Result',
          brand: 'Generated',
          price: item.garmentId?.price || '0',
          image: item.resultImage, // Only show the generated result
          date: new Date(item.createdAt).toLocaleDateString(),
          liked: false
        })).filter((item: any) => item.image); // Only show items with results
        setHistoryItems(formattedHistory);
      }
    } catch (_err) {
      console.log("Failed to fetch history", _err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchSavedItems();
  }, [fetchHistory, fetchSavedItems]);

  /* ─────────────────────────────
     Handlers
  ────────────────────────────── */

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // @ts-ignore
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUserImage(result.assets[0].uri);
        Alert.alert("Image Selected", "You can now generate the try-on.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleGenerateValues = async () => {
    if (!userImage) {
      Alert.alert("Required", "Please upload your photo first");
      return;
    }
    if (!currentItem) {
      Alert.alert("Required", "Please select a garment");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Upload User Image
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // Web: Convert URI to Blob
        try {
          const res = await fetch(userImage);
          const blob = await res.blob();
          // On web, direct append works with blob
          formData.append('image', blob, 'user_tryon.jpg');
        } catch (blobError) {
          console.error("Blob conversion error:", blobError);
          Alert.alert("Error", "Failed to process image for upload");
          setIsGenerating(false);
          return;
        }
      } else {
        // Native: Use URI object
        formData.append('image', {
          uri: userImage,
          type: 'image/jpeg',
          name: 'user_tryon.jpg',
        } as any);
      }

      // We use the productService or generic upload.
      // Assuming tryOnService.uploadImage wraps the correct endpoint.
      // If uploadImage returns { imageUrl: '...' }
      const uploadRes = await tryOnService.uploadImage(formData);
      const userImageUrl = uploadRes.imageUrl || uploadRes.url; // Adapt based on actual response

      const garmentImg = getGarmentImage(currentItem);
      if (!garmentImg) {
        Alert.alert("Error", "Selected garment has no image");
        setIsGenerating(false);
        return;
      }

      // 2. Call Generate API
      const generateRes = await tryOnService.generateTryOn({
        garment_img: garmentImg,
        human_img: userImageUrl,
        garmentId: (currentItem as any)._id || currentItem.id // Handle both _id and id
      });

      if (generateRes.resultUrl) {
        setResultImage(generateRes.resultUrl);
        setResultId(generateRes._id || generateRes.id);
        fetchHistory(); // Refresh history
        Alert.alert("Success", "Virtual Try-On Generated!");
      }

    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate try-on");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryOnItem = (item: ClothingItem) => {
    setSelectedClothing(item);
    setResultImage(null); // Reset result when changing item
    Alert.alert("Selected", `Selected ${item.name}`);
  };

  const handleSaveTryOn = () => {
    setIsSaved((prev) => !prev);
    // TODO: Implement save logic
  };

  const handleAddToCart = async () => {
    if (!currentItem) {
      Alert.alert("Error", "Please select a product first");
      return;
    }

    // Validate size and color selection
    if (!selectedSize) {
      Alert.alert("Size Required", "Please select a size before adding to cart");
      return;
    }

    if (!selectedColor) {
      Alert.alert("Color Required", "Please select a color before adding to cart");
      return;
    }

    try {
      // Extract productId as a string
      const productId = String((currentItem as any)._id || currentItem.id);

      console.log('Adding to cart:', { productId, size: selectedSize, color: selectedColor });

      // Call with separate parameters: productId, quantity, selectedOptions
      await cartService.addToCart(
        productId,
        1,
        { size: selectedSize, color: selectedColor }
      );

      Alert.alert("Success", "Product added to cart!");
    } catch (error: any) {
      console.error('Add to cart error:', error);
      Alert.alert("Error", error.message || "Failed to add to cart");
    }
  };

  const handlePost = () => {
    // Navigate to create post screen with result image
    if (resultImage) {
      router.push({
        pathname: "/social/post/create",
        params: {
          image: resultImage,
          tryOnId: resultId,
          productId: initialProduct?._id || initialProduct?.id,
          productName: initialProduct?.name || currentItem?.name
        }
      });
    } else {
      Alert.alert("Error", "No result generated yet");
    }
  };

  const handleShare = () => {
    Alert.alert("Share", "Sharing functionality coming soon");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TryOnHeader
          title="Virtual Try-On"
          onBack={() => router.back()}
        />

        {/* Show message if no product selected */}
        {!currentItem ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' }}>
              No Product Selected
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
              Please save some products to your favorites to try them on, or select a product from the home screen.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(main)/search')}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 25,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Three-Stage Preview Section */}
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
                Try-On Preview
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                {/* 1. Product Image */}
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6, textAlign: 'center' }}>Product</Text>
                  <Image
                    source={{ uri: typeof getGarmentImage(currentItem) === 'string' ? getGarmentImage(currentItem) : 'https://placehold.co/200x250/png?text=Product' }}
                    style={{ width: '100%', height: 150, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </View>

                {/* 2. User Photo */}
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: userImage ? colors.primary : colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6, textAlign: 'center' }}>Your Photo</Text>
                  {userImage ? (
                    <Image
                      source={{ uri: typeof userImage === 'string' ? userImage : 'https://via.placeholder.com/300' }}
                      style={{ width: '100%', height: 150, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                      <ImageIcon size={32} color={colors.textSecondary} />
                      <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>Upload Photo</Text>
                    </View>
                  )}
                </View>

                {/* 3. Generated Result */}
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: resultImage ? colors.success : colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6, textAlign: 'center' }}>Result</Text>
                  {isGenerating ? (
                    <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>Generating...</Text>
                    </View>
                  ) : resultImage ? (
                    <TouchableOpacity onPress={() => setFullSizeImage(resultImage)}>
                      <Image
                        source={{ uri: typeof resultImage === 'string' ? resultImage : 'https://via.placeholder.com/300' }}
                        style={{ width: '100%', height: 150, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                      <Sparkles size={32} color={colors.textSecondary} />
                      <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>Not Generated</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Upload Control */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10, gap: 10 }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Camera size={20} color={colors.primary} />
                <Text style={{ marginLeft: 8, color: colors.text, fontWeight: '600' }}>
                  {userImage ? 'Change Photo' : 'Upload Photo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateValues}
                disabled={!userImage || isGenerating}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: (!userImage || isGenerating) ? colors.disabled : colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                }}
              >
                <Sparkles size={20} color="white" />
                <Text style={{ marginLeft: 8, color: 'white', fontWeight: '600' }}>
                  {isGenerating ? 'Generating...' : 'Generate Try-On'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Post Button (if result exists) */}
            {resultImage && (
              <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={handlePost}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>📤 Post to Community</Text>
                </TouchableOpacity>
                <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>
                  Share your look with the community!
                </Text>
              </View>
            )}

            {/* Clothing Info */}
            <ClothingInfo
              item={currentItem}
              isSaved={isSaved}
              onToggleSave={handleSaveTryOn}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onSelectSize={setSelectedSize}
              onSelectColor={setSelectedColor}
            />

            {/* Actions */}
            <ActionButtons
              onAddToCart={handleAddToCart}
              onPost={handlePost}
              onShare={handleShare}
            />

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <SavedItemsSection
                items={savedItems}
                onTryOnItem={handleTryOnItem}
              />
            )}

            {/* History */}
            <TryOnHistory
              items={historyItems.length > 0 ? historyItems : []}
              onTryAgain={(item) => {
                // Navigate to create post screen with try-on result image
                if (item.image) {
                  router.push({
                    pathname: "/social/post/create",
                    params: {
                      image: item.image,
                      tryOnId: item.id,
                      productName: item.name
                    }
                  });
                } else {
                  Alert.alert("Error", "No image available for this try-on");
                }
              }}
              onItemPress={(item) => {
                // Open full-size image modal
                setFullSizeImage(item.image);
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Full-Size Image Modal */}
      <Modal
        visible={!!fullSizeImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullSizeImage(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFullSizeImage(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Image
              source={{ uri: typeof fullSizeImage === 'string' ? fullSizeImage : 'https://via.placeholder.com/600' }}
              style={{
                width: Dimensions.get('window').width * 0.9,
                height: Dimensions.get('window').height * 0.8,
                borderRadius: 12,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFullSizeImage(null)}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 20,
              padding: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TryOnScreen;
