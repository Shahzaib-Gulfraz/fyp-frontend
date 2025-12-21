// app/(main)/shop/storefront.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Palette,
  Layout,
  Eye,
  Save,
  Image as ImageIcon,
  Tag,
  Package,
  Truck,
  Shield,
  Globe,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import ColorPicker from 'react-native-wheel-color-picker';

export default function ConfigureStorefrontScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  
  const [storefrontData, setStorefrontData] = useState({
    // Design Settings
    primaryColor: "#00BCD4",
    secondaryColor: "#FF6B6B",
    fontFamily: "System",
    themeMode: "light",
    showBanner: true,
    bannerImage: null as string | null,
    
    // Layout Settings
    layoutType: "grid",
    productsPerRow: 3,
    showCategories: true,
    showFilters: true,
    showSearch: true,
    
    // Product Display
    showPrices: true,
    showStock: true,
    showRatings: true,
    enableWishlist: true,
    
    // Shipping & Policies
    freeShippingThreshold: 50,
    shippingMethods: [
      { id: "standard", name: "Standard Shipping", price: 4.99, enabled: true },
      { id: "express", name: "Express Shipping", price: 9.99, enabled: true },
      { id: "pickup", name: "Local Pickup", price: 0, enabled: false },
    ],
    returnDays: 30,
    
    // SEO & Social
    metaTitle: "My Fashion Store",
    metaDescription: "Best fashion store with virtual try-on",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setStorefrontData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingMethodToggle = (id: string) => {
    setStorefrontData(prev => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert("Success", "Storefront settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "design", label: "Design", icon: <Palette size={18} /> },
    { id: "layout", label: "Layout", icon: <Layout size={18} /> },
    { id: "products", label: "Products", icon: <Package size={18} /> },
    { id: "shipping", label: "Shipping", icon: <Truck size={18} /> },
    { id: "seo", label: "SEO", icon: <Globe size={18} /> },
  ];

  const renderDesignTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Primary Color</Text>
        <View style={styles.colorPickerContainer}>
          <View style={[styles.colorPreview, { backgroundColor: storefrontData.primaryColor }]} />
          <TextInput
            style={styles.colorInput}
            value={storefrontData.primaryColor}
            onChangeText={(text) => handleInputChange('primaryColor', text)}
            placeholder="#00BCD4"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Secondary Color</Text>
        <View style={styles.colorPickerContainer}>
          <View style={[styles.colorPreview, { backgroundColor: storefrontData.secondaryColor }]} />
          <TextInput
            style={styles.colorInput}
            value={storefrontData.secondaryColor}
            onChangeText={(text) => handleInputChange('secondaryColor', text)}
            placeholder="#FF6B6B"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.toggleGroup}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Eye size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Show Banner</Text>
              <Text style={styles.toggleDescription}>
                Display banner image on storefront
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.showBanner}
            onValueChange={(value) => handleInputChange('showBanner', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.showBanner ? '#00BCD4' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Theme Mode</Text>
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              storefrontData.themeMode === "light" && styles.themeOptionSelected
            ]}
            onPress={() => handleInputChange('themeMode', 'light')}
          >
            <Text style={[
              styles.themeOptionText,
              storefrontData.themeMode === "light" && styles.themeOptionTextSelected
            ]}>
              Light
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.themeOption,
              storefrontData.themeMode === "dark" && styles.themeOptionSelected
            ]}
            onPress={() => handleInputChange('themeMode', 'dark')}
          >
            <Text style={[
              styles.themeOptionText,
              storefrontData.themeMode === "dark" && styles.themeOptionTextSelected
            ]}>
              Dark
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.themeOption,
              storefrontData.themeMode === "auto" && styles.themeOptionSelected
            ]}
            onPress={() => handleInputChange('themeMode', 'auto')}
          >
            <Text style={[
              styles.themeOptionText,
              storefrontData.themeMode === "auto" && styles.themeOptionTextSelected
            ]}>
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLayoutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Layout Type</Text>
        <View style={styles.layoutOptions}>
          <TouchableOpacity
            style={[
              styles.layoutOption,
              storefrontData.layoutType === "grid" && styles.layoutOptionSelected
            ]}
            onPress={() => handleInputChange('layoutType', 'grid')}
          >
            <Text style={styles.layoutOptionText}>Grid</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.layoutOption,
              storefrontData.layoutType === "list" && styles.layoutOptionSelected
            ]}
            onPress={() => handleInputChange('layoutType', 'list')}
          >
            <Text style={styles.layoutOptionText}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Products Per Row (Grid only)</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleInputChange('productsPerRow', Math.max(2, storefrontData.productsPerRow - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityValue}>{storefrontData.productsPerRow}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleInputChange('productsPerRow', Math.min(5, storefrontData.productsPerRow + 1))}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleGroup}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Layout size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Show Categories</Text>
              <Text style={styles.toggleDescription}>
                Display category filters
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.showCategories}
            onValueChange={(value) => handleInputChange('showCategories', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.showCategories ? '#00BCD4' : '#FFFFFF'}
          />
        </View>

        <View style={[styles.toggleRow, styles.toggleRowBorder]}>
          <View style={styles.toggleInfo}>
            <Layout size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Show Search Bar</Text>
              <Text style={styles.toggleDescription}>
                Enable storefront search
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.showSearch}
            onValueChange={(value) => handleInputChange('showSearch', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.showSearch ? '#00BCD4' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderProductsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.toggleGroup}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Tag size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Show Prices</Text>
              <Text style={styles.toggleDescription}>
                Display product prices
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.showPrices}
            onValueChange={(value) => handleInputChange('showPrices', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.showPrices ? '#00BCD4' : '#FFFFFF'}
          />
        </View>

        <View style={[styles.toggleRow, styles.toggleRowBorder]}>
          <View style={styles.toggleInfo}>
            <Package size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Show Stock Status</Text>
              <Text style={styles.toggleDescription}>
                Display available stock
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.showStock}
            onValueChange={(value) => handleInputChange('showStock', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.showStock ? '#00BCD4' : '#FFFFFF'}
          />
        </View>

        <View style={[styles.toggleRow, styles.toggleRowBorder]}>
          <View style={styles.toggleInfo}>
            <Shield size={20} color="#666" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Enable Wishlist</Text>
              <Text style={styles.toggleDescription}>
                Allow customers to save favorites
              </Text>
            </View>
          </View>
          <Switch
            value={storefrontData.enableWishlist}
            onValueChange={(value) => handleInputChange('enableWishlist', value)}
            trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
            thumbColor={storefrontData.enableWishlist ? '#00BCD4' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderShippingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Free Shipping Threshold</Text>
        <View style={styles.priceInput}>
          <Text style={styles.priceSymbol}>$</Text>
          <TextInput
            style={styles.priceInputField}
            value={storefrontData.freeShippingThreshold.toString()}
            onChangeText={(text) => handleInputChange('freeShippingThreshold', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor="#999"
          />
        </View>
        <Text style={styles.inputHint}>
          Free shipping for orders above this amount
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Shipping Methods</Text>
        <View style={styles.shippingMethods}>
          {storefrontData.shippingMethods.map((method) => (
            <View key={method.id} style={styles.shippingMethod}>
              <View style={styles.shippingMethodInfo}>
                <Text style={styles.shippingMethodName}>{method.name}</Text>
                <Text style={styles.shippingMethodPrice}>
                  ${method.price === 0 ? "Free" : method.price.toFixed(2)}
                </Text>
              </View>
              <Switch
                value={method.enabled}
                onValueChange={() => handleShippingMethodToggle(method.id)}
                trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
                thumbColor={method.enabled ? '#00BCD4' : '#FFFFFF'}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Return Policy Days</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleInputChange('returnDays', Math.max(0, storefrontData.returnDays - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityValue}>{storefrontData.returnDays} days</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleInputChange('returnDays', storefrontData.returnDays + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSEOTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Meta Title</Text>
        <TextInput
          style={styles.input}
          value={storefrontData.metaTitle}
          onChangeText={(text) => handleInputChange('metaTitle', text)}
          placeholder="Shop name for search engines"
          placeholderTextColor="#999"
        />
        <Text style={styles.charCount}>
          {storefrontData.metaTitle.length}/60 characters
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Meta Description</Text>
        <TextInput
          style={styles.textArea}
          value={storefrontData.metaDescription}
          onChangeText={(text) => handleInputChange('metaDescription', text)}
          placeholder="Shop description for search results"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {storefrontData.metaDescription.length}/160 characters
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Social Links</Text>
        <TextInput
          style={styles.input}
          value={storefrontData.socialLinks.facebook}
          onChangeText={(text) => handleInputChange('socialLinks', {
            ...storefrontData.socialLinks,
            facebook: text
          })}
          placeholder="Facebook page URL"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={storefrontData.socialLinks.instagram}
          onChangeText={(text) => handleInputChange('socialLinks', {
            ...storefrontData.socialLinks,
            instagram: text
          })}
          placeholder="Instagram profile URL"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={storefrontData.socialLinks.twitter}
          onChangeText={(text) => handleInputChange('socialLinks', {
            ...storefrontData.socialLinks,
            twitter: text
          })}
          placeholder="Twitter profile URL"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "design": return renderDesignTab();
      case "layout": return renderLayoutTab();
      case "products": return renderProductsTab();
      case "shipping": return renderShippingTab();
      case "seo": return renderSEOTab();
      default: return null;
    }
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
          
          <Text style={styles.headerTitle}>Configure Storefront</Text>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.bottomSaveButton,
            isLoading && styles.bottomSaveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Storefront Settings</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Preview Button */}
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => Alert.alert("Preview", "This would show a preview of your storefront")}
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
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    saveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#00BCD4",
      justifyContent: "center",
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    tabsContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabsContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    tabButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      gap: 8,
    },
    activeTabButton: {
      backgroundColor: "#E0F7FA",
      borderColor: "#00BCD4",
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#666",
    },
    activeTabLabel: {
      color: "#00BCD4",
    },
    tabContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    colorPickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    colorPreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
    },
    colorInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    toggleGroup: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toggleRowBorder: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    toggleInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    toggleTexts: {
      marginLeft: 12,
    },
    toggleTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    toggleDescription: {
      fontSize: 12,
      color: "#666",
    },
    themeOptions: {
      flexDirection: "row",
      gap: 8,
    },
    themeOption: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    themeOptionSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    themeOptionText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    themeOptionTextSelected: {
      color: "#00BCD4",
    },
    layoutOptions: {
      flexDirection: "row",
      gap: 12,
    },
    layoutOption: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: "center",
    },
    layoutOptionSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    layoutOptionText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    quantitySelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    quantityButtonText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: "bold",
    },
    quantityValue: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      minWidth: 80,
      textAlign: "center",
    },
    priceInput: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    priceSymbol: {
      fontSize: 16,
      color: colors.text,
      marginRight: 8,
    },
    priceInputField: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
    },
    inputHint: {
      fontSize: 12,
      color: "#666",
      marginTop: 8,
    },
    shippingMethods: {
      gap: 12,
    },
    shippingMethod: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    shippingMethodInfo: {
      flex: 1,
    },
    shippingMethodName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    shippingMethodPrice: {
      fontSize: 14,
      color: "#00BCD4",
      fontWeight: "500",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      minHeight: 80,
      textAlignVertical: "top",
    },
    charCount: {
      fontSize: 12,
      color: "#999",
      marginTop: 8,
      textAlign: "right",
    },
    bottomSaveButton: {
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 20,
      marginTop: 24,
    },
    bottomSaveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    previewButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
      padding: 16,
    },
    previewButtonText: {
      fontSize: 16,
      color: "#00BCD4",
      fontWeight: "500",
    },
  });