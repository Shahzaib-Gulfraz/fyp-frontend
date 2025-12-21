// app/(main)/shop/dashboard.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Store,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  BarChart3,
  DollarSign,
} from "lucide-react-native";
import React from "react";
import { useTheme } from "../../../src/context/ThemeContext";

export default function ShopDashboardScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();

  const stats = [
    { label: "Total Sales", value: "$12,458", change: "+12.5%", icon: <DollarSign size={20} color="#00BCD4" /> },
    { label: "Orders", value: "248", change: "+8.2%", icon: <ShoppingBag size={20} color="#00BCD4" /> },
    { label: "Products", value: "56", change: "+15%", icon: <Package size={20} color="#00BCD4" /> },
    { label: "Customers", value: "1.2K", change: "+5.3%", icon: <Users size={20} color="#00BCD4" /> },
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "List new item",
      icon: <Plus size={24} color="#00BCD4" />,
      onPress: () => router.push("/shop/products/add"),
    },
    {
      title: "View Orders",
      description: "Process orders",
      icon: <ShoppingBag size={24} color="#00BCD4" />,
      onPress: () => router.push("/shop/orders"),
    },
    {
      title: "Analytics",
      description: "View insights",
      icon: <BarChart3 size={24} color="#00BCD4" />,
      onPress: () => router.push("/shop/analytics"),
    },
    {
      title: "Storefront",
      description: "Customize shop",
      icon: <Eye size={24} color="#00BCD4" />,
      onPress: () => router.push("/shop/storefront"),
    },
  ];

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
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Shop</Text>
            <Text style={styles.headerSubtitle}>Fashion Store • Active</Text>
          </View>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/shop/settings")}
          >
            <Settings size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                {stat.icon}
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={styles.actionIcon}>
                  {action.icon}
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shop Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Management</Text>
          
          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push("/shop/storefront")}
          >
            <View style={styles.managementInfo}>
              <Store size={24} color="#00BCD4" />
              <View style={styles.managementTexts}>
                <Text style={styles.managementTitle}>Storefront Settings</Text>
                <Text style={styles.managementDescription}>
                  Customize your shop appearance and layout
                </Text>
              </View>
            </View>
            <Text style={styles.managementArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push("/shop/staff")}
          >
            <View style={styles.managementInfo}>
              <Users size={24} color="#00BCD4" />
              <View style={styles.managementTexts}>
                <Text style={styles.managementTitle}>Staff Management</Text>
                <Text style={styles.managementDescription}>
                  Add and manage shop staff members
                </Text>
              </View>
            </View>
            <Text style={styles.managementArrow}>›</Text>
          </TouchableOpacity>
        </View>
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
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: "#666",
      marginTop: 2,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      marginTop: 20,
      gap: 12,
    },
    statCard: {
      width: "48%",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 12,
      color: "#666",
      marginLeft: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    statChange: {
      fontSize: 12,
      color: "#4CAF50",
      fontWeight: "600",
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    actionCard: {
      width: "48%",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#E0F7FA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 11,
      color: "#666",
      textAlign: "center",
    },
    managementCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 20,
      marginBottom: 12,
    },
    managementInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    managementTexts: {
      marginLeft: 16,
      flex: 1,
    },
    managementTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    managementDescription: {
      fontSize: 12,
      color: "#666",
    },
    managementArrow: {
      fontSize: 24,
      color: "#999",
      fontWeight: "bold",
    },
  });