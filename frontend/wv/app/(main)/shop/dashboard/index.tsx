import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Store,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

import Header from "./Header";
import StatCard from "./StatCard";
import QuickActionCard from "./QuickActionCard";
import ManagementItem from "./ManagementItem";
import RecentOrderCard from "./RecentOrderCard";

export default function ShopDashboard() {
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const styles = getStyles();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <Header />

      

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // Prevent last item overlay
        style={{ flex: 1 }}
      >
        {/* Stats */}
        <View style={styles.grid}>
          <StatCard
            label="Total Sales"
            value="$12,458"
            change="+12.5%"
            icon={<DollarSign size={20} color="#00BCD4" />}
          />
          <StatCard
            label="Orders"
            value="248"
            change="+8.2%"
            icon={<ShoppingBag size={20} color="#00BCD4" />}
          />
          <StatCard
            label="Products"
            value="56"
            change="+15%"
            icon={<Package size={20} color="#00BCD4" />}
          />
          <StatCard
            label="Customers"
            value="1.2K"
            change="+5.3%"
            icon={<Users size={20} color="#00BCD4" />}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActionCard
            title="Add Product"
            description="List new item"
            icon={<ShoppingBag size={24} color="#00BCD4" />}
            onPress={() => router.push("/shop/addProduct")}
          />
          <QuickActionCard
            title="Analytics"
            description="View insights"
            icon={<DollarSign size={24} color="#00BCD4" />}
            onPress={() => router.push("/shop/analytics")}
          />
        </View>

        {/* Management */}
        <View style={styles.section}>
          <ManagementItem
            title="Storefront Settings"
            description="Customize your shop appearance"
            icon={<Store size={24} color="#00BCD4" />}
            onPress={() => router.push("/shop/storefront")}
          />
          <ManagementItem
            title="Staff Management"
            description="Manage shop staff"
            icon={<Users size={24} color="#00BCD4" />}
            onPress={() => router.push("/shop/staff")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      padding: 20,
    },
    section: {
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 20,
    },
  });
