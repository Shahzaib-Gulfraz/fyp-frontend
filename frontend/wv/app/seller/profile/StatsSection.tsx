// src/components/storefront/StatsSection.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { appTheme } from "@/src/theme/appTheme";

interface StatsSectionProps {
  stats: {
    totalSales: number;
    monthlyRevenue: number;
    conversionRate: number;
    avgOrderValue: number;
    visitorCount: number;
    returningCustomers: number;
    products: {
      total: number;
      published: number;
      draft: number;
    };
  };
  onViewAnalytics?: () => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, onViewAnalytics }) => {
  const { colors, tokens } = useTheme();
  const styles = makeStyles(colors, tokens);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Shop Performance</Text>
          {onViewAnalytics && <Text style={styles.viewAll} onPress={onViewAnalytics}>View Analytics →</Text>}
        </View>

        <View style={styles.statsGrid}>
          {/* Total Sales */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.totalSales)}</Text>
          </View>

          {/* Monthly Revenue */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="calendar" size={20} color={colors.accent} />
              <Text style={styles.statLabel}>Monthly Revenue</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.monthlyRevenue)}</Text>
          </View>

          {/* Conversion Rate */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
            <View style={styles.rateContainer}>
              <Text style={styles.statValue}>{stats.conversionRate}%</Text>
              <ProgressBar progress={stats.conversionRate / 100} color={colors.primary} style={styles.progressBar} />
            </View>
          </View>

          {/* Avg Order Value */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="cart" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Avg. Order Value</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</Text>
          </View>

          {/* Visitor Analytics */}
          <View style={[styles.statCard, styles.wideCard]}>
            <View style={styles.statHeader}>
              <Ionicons name="people" size={20} color={colors.accent} />
              <Text style={styles.statLabel}>Visitor Analytics</Text>
            </View>
            <View style={styles.visitorStats}>
              <View style={styles.visitorItem}>
                <Text style={styles.visitorValue}>{stats.visitorCount.toLocaleString()}</Text>
                <Text style={styles.visitorLabel}>Total Visitors</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.visitorItem}>
                <Text style={styles.visitorValue}>{stats.returningCustomers}%</Text>
                <Text style={styles.visitorLabel}>Returning</Text>
              </View>
            </View>
          </View>

          {/* Product Stats */}
          <View style={[styles.statCard, styles.wideCard]}>
            <View style={styles.statHeader}>
              <Ionicons name="cube" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Product Status</Text>
            </View>
            <View style={styles.productStats}>
              {[
                { label: "Total", value: stats.products.total, bg: colors.primary },
                { label: "Published", value: stats.products.published, bg: colors.success },
                { label: "Draft", value: stats.products.draft, bg: colors.textTertiary },
              ].map((p) => (
                <View style={styles.productItem} key={p.label}>
                  <View style={[styles.productBadge, { backgroundColor: p.bg }]}>
                    <Text style={styles.productBadgeText}>{p.value}</Text>
                  </View>
                  <Text style={styles.productLabel}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const makeStyles = (colors: typeof appTheme.light.colors, tokens: typeof appTheme.tokens) =>
  StyleSheet.create({
    container: { marginHorizontal: tokens.spacing.md, marginVertical: tokens.spacing.sm, backgroundColor: colors.surface },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: tokens.spacing.lg },
    title: { fontSize: 18, fontWeight: "700", color: colors.text },
    viewAll: { fontSize: 14, color: colors.primary, fontWeight: "500" },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    statCard: { width: "48%", marginBottom: tokens.spacing.md, padding: tokens.spacing.md, backgroundColor: colors.background, borderRadius: tokens.radius.md },
    wideCard: { width: "100%" },
    statHeader: { flexDirection: "row", alignItems: "center", marginBottom: tokens.spacing.sm },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginLeft: tokens.spacing.sm, flex: 1 },
    statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
    rateContainer: { marginTop: 4 },
    progressBar: { height: 4, borderRadius: 2, marginTop: 4, backgroundColor: colors.divider },
    visitorStats: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: tokens.spacing.sm },
    visitorItem: { alignItems: "center", flex: 1 },
    visitorValue: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 2 },
    visitorLabel: { fontSize: 11, color: colors.textSecondary },
    divider: { width: 1, height: 40, backgroundColor: colors.divider },
    productStats: { flexDirection: "row", justifyContent: "space-around", marginTop: tokens.spacing.sm },
    productItem: { alignItems: "center" },
    productBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 4 },
    productBadgeText: { fontSize: 14, fontWeight: "700", color: "#fff" },
    productLabel: { fontSize: 11, color: colors.textSecondary },
  });

export default StatsSection;
