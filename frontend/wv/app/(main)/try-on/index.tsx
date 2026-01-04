import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/context/ThemeContext";

import TryOnHeader from "./components/TryOnHeader";
import ViewModeToggle from "./components/ViewModeToggle";
import PreviewSection from "./components/PreviewSection";
import ClothingInfo from "./components/ClothingInfo";
import ActionButtons from "./components/ActionButtons";
import SavedItemsSection from "./components/SavedItemsSection";
import TryOnHistory from "./components/TryOnHistory";

import {
  MOCK_CLOTHING_ITEMS,
  CURRENT_TRY_ON,
  FILTERS,
  TRY_ON_HISTORY,
} from "./constants/mockData";

import { ViewMode, ClothingItem } from "./types";

const TryOnScreen = () => {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  const [hasAvatar] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [selectedClothing, setSelectedClothing] =
    useState<ClothingItem | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  // Selection state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const currentItem = selectedClothing || CURRENT_TRY_ON;

  /* ─────────────────────────────
     Handlers
  ────────────────────────────── */

  const handleTryOnItem = (item: ClothingItem) => {
    setSelectedClothing(item);
    Alert.alert("Trying On", `Now trying on ${item.name}`);
  };

  const handleSaveTryOn = () => {
    setIsSaved((prev) => !prev);
    Alert.alert(
      isSaved ? "Removed" : "Saved",
      isSaved
        ? "Removed from saved try-ons"
        : "Saved to your try-on history"
    );
  };

  const handleBuyNow = () => {
    // Navigate to buy screen with params
    router.push({
      pathname: '/(main)/buy',
      params: {
        item: JSON.stringify(currentItem),
        selectedSize: selectedSize || '',
        selectedColor: selectedColor || ''
      }
    });
  };

  const handlePost = () => {
    Alert.alert("Post", "Sharing your try-on to community...");
  };

  const handleApplyFilter = (filterId: string) => {
    setCurrentFilter(filterId === "none" ? null : filterId);
  };

  const handleShare = () => {
    Alert.alert("Share", "Sharing functionality coming soon");
  };

  if (!hasAvatar) {
    // Avatar creation flow later
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TryOnHeader
          title="Virtual Try-On"
          onBack={() => router.replace("/(tabs)/home")}
        />

        {/* View Toggle */}
        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />

        {/* Preview */}
        <PreviewSection
          imageUri={currentItem.image}
          mode={viewMode}
          filters={FILTERS}
          currentFilter={currentFilter}
          onFilterSelect={handleApplyFilter}
        />

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
          onBuyNow={handleBuyNow}
          onPost={handlePost}
          onShare={handleShare}
        />

        {/* Saved Items */}
        <SavedItemsSection
          items={MOCK_CLOTHING_ITEMS}
          onTryOnItem={handleTryOnItem}
        />

        {/* History */}
        <TryOnHistory
          items={TRY_ON_HISTORY}
          onTryAgain={(item) =>
            handleTryOnItem(item as unknown as ClothingItem)
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TryOnScreen;
