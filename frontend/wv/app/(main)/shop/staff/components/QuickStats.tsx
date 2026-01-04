import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface QuickStatsProps {
  totalStaff: number;
  activeStaff: number;
  pendingStaff: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalStaff,
  activeStaff,
  pendingStaff,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalStaff}</Text>
        <Text style={styles.statLabel}>Total Staff</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{activeStaff}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{pendingStaff}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );
};

/* ===================== STYLES ===================== */

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 24,
    },

    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      marginHorizontal: 6,
    },

    statNumber: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 4,
    },

    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
    },
  });
