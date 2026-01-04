import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Palette,
  Layout,
  Package,
  Truck,
  Globe,
  Save,
  Eye,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { StorefrontHeader } from "./components/StorefrontHeader";
import { TabNavigation } from "./components/TabNavigation";
import { DesignTab } from "./components/DesignTab";
import { LayoutTab } from "./components/LayoutTab";
import { ProductsTab } from "./components/ProductsTab";
import { ShippingTab } from "./components/ShippingTab";
import { SEOTab } from "./components/SEOTab";

export default function ConfigureStorefrontScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("design");

  const [storefrontData, setStorefrontData] = useState({
    primaryColor: "#00BCD4",
    secondaryColor: "#FF6B6B",
    fontFamily: "System",
    themeMode: "light",
    showBanner: true,
    bannerImage: null as string | null,
    layoutType: "grid",
    productsPerRow: 3,
    showCategories: true,
    showFilters: true,
    showSearch: true,
    showPrices: true,
    showStock: true,
    showRatings: true,
    enableWishlist: true,
    freeShippingThreshold: 50,
    shippingMethods: [
      { id: "standard", name: "Standard Shipping", price: 4.99, enabled: true },
      { id: "express", name: "Express Shipping", price: 9.99, enabled: true },
      { id: "pickup", name: "Local Pickup", price: 0, enabled: false },
    ],
    returnDays: 30,
    metaTitle: "My Fashion Store",
    metaDescription: "Best fashion store with virtual try-on",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setStorefrontData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingMethodToggle = (id: string) => {
    setStorefrontData((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      ),
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success", "Storefront settings saved successfully!");
    } catch {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "design",
      label: "Design",
      icon: (
        <Palette
          size={18}
          color={
            activeTab === "design"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      ),
    },
    {
      id: "layout",
      label: "Layout",
      icon: (
        <Layout
          size={18}
          color={
            activeTab === "layout"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      ),
    },
    {
      id: "products",
      label: "Products",
      icon: (
        <Package
          size={18}
          color={
            activeTab === "products"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      ),
    },
    {
      id: "shipping",
      label: "Shipping",
      icon: (
        <Truck
          size={18}
          color={
            activeTab === "shipping"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      ),
    },
    {
      id: "seo",
      label: "SEO",
      icon: (
        <Globe
          size={18}
          color={
            activeTab === "seo"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      ),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "design":
        return (
          <DesignTab
            theme={theme}
            storefrontData={storefrontData}
            onInputChange={handleInputChange}
          />
        );
      case "layout":
        return (
          <LayoutTab
            theme={theme}
            storefrontData={storefrontData}
            onInputChange={handleInputChange}
          />
        );
      case "products":
        return (
          <ProductsTab
            theme={theme}
            storefrontData={storefrontData}
            onInputChange={handleInputChange}
          />
        );
      case "shipping":
        return (
          <ShippingTab
            theme={theme}
            storefrontData={storefrontData}
            onInputChange={handleInputChange}
            onShippingMethodToggle={handleShippingMethodToggle}
          />
        );
      case "seo":
        return (
          <SEOTab
            theme={theme}
            storefrontData={storefrontData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <StorefrontHeader
        theme={theme}
        isLoading={isLoading}
        onSave={handleSave}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TabNavigation
          theme={theme}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {renderTabContent()}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.bottomSaveButton,
            isLoading && styles.bottomSaveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                Save Storefront Settings
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Preview Button */}
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() =>
            Alert.alert(
              "Preview",
              "This would show a preview of your storefront"
            )
          }
        >
          <Eye size={20} color="#00BCD4" />
          <Text style={styles.previewButtonText}>Preview Storefront</Text>
        </TouchableOpacity>
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },

    bottomSaveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      marginHorizontal: 20,
      marginTop: 32,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 10,
    },
    saveButtonText: {
      color: colors.onPrimary, // ensures text contrasts with primary color
      fontSize: 16,
      fontWeight: "700",
    },

    bottomSaveButtonDisabled: {
      opacity: 0.7,
    },

    previewButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      marginHorizontal: 20,
      marginTop: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: 10,
    },
    previewButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
