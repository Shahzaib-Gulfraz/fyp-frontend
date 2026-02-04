// shop/addProduct/index.tsx
import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Plus, Grid3x3, Settings } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { appTheme } from "@/src/theme/appTheme";

import ManagementTabs from "./components/ManagementTabs";
import ProductMetadataForm from "./components/ProductMetadataForm";
import CatalogSection from "./components/CatalogSection";

type TabType = "catalog" | "manage";

const ProductCatalogScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { colors, isDark } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;
  const router = useRouter();

  const tabs = useMemo(
    () => [
      {
        id: "catalog" as TabType,
        label: "Catalog",
        icon: (active: boolean) => (
          <Grid3x3 size={20} color={active ? colors.primary : colors.textSecondary} />
        ),
      },
      {
        id: "manage" as TabType,
        label: editingProduct ? "Edit Product" : "Add Product",
        icon: (active: boolean) => (
          editingProduct ?
            <Settings size={20} color={active ? colors.primary : colors.textSecondary} /> :
            <Plus size={20} color={active ? colors.primary : colors.textSecondary} />
        ),
      },
    ],
    [colors, editingProduct]
  );

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setActiveTab("manage");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "catalog":
        return <CatalogSection onEditProduct={handleEditProduct} />;

      case "manage":
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: spacing.xl }
            ]}
          >
            <View style={[
              styles.section,
              { marginBottom: spacing.lg }
            ]}>
              <Text style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontFamily: fonts.semiBold,
                  fontSize: 20,
                  marginBottom: spacing.md,
                }
              ]}>
                {editingProduct ? "Edit Product Details" : "New Product Details"}
              </Text>
              <Text style={[
                styles.sectionDescription,
                {
                  color: colors.textSecondary,
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  lineHeight: 20,
                  marginBottom: spacing.lg,
                }
              ]}>
                {editingProduct
                  ? "Update your product information and images"
                  : "Complete product information to add to your catalog"}
              </Text>
            </View>

            <ProductMetadataForm
              editProduct={editingProduct}
              onSuccess={() => {
                setActiveTab("catalog");
                setEditingProduct(null);
              }}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ marginTop: 20 }}>
        <ManagementTabs
          title="Product Management"
          subtitle="Manage your shop inventory"
          showBack
          onBackPress={() => router.replace('/seller/products')}
        />
      </View>

      {/* Custom Tabs */}
      <View style={[
        styles.tabsContainer,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }
      ]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                isActive && [
                  styles.activeTab,
                  { borderBottomColor: colors.primary }
                ]
              ]}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabIcon,
                {
                  backgroundColor: isActive
                    ? colors.primary + "15"
                    : "transparent",
                  borderRadius: radius.full,
                }
              ]}>
                {tab.icon(isActive)}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontFamily: isActive ? fonts.semiBold : fonts.medium,
                    fontSize: 12,
                    marginTop: spacing.xs,
                  }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});

export default ProductCatalogScreen;