// RolesOverview.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Shield } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface RolesOverviewProps {
  staffMembers: {
    role: string;
  }[];
  onRolePress: () => void;
}

export const RolesOverview: React.FC<RolesOverviewProps> = ({
  staffMembers,
  onRolePress,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  const staffCount = staffMembers.filter(
    (member) => member.role === "staff"
  ).length;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Roles & Permissions</Text>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={onRolePress}
        activeOpacity={0.8}
      >
        <View style={styles.roleIcon}>
          <Shield size={20} color={colors.primary} />
        </View>

        <View style={styles.roleContent}>
          <Text style={styles.roleTitle}>Staff Role</Text>
          <Text style={styles.roleSubtitle}>6 permissions</Text>
        </View>

        <View style={styles.roleStats}>
          <Text style={styles.roleCount}>
            {staffCount} members
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/* ===================== STYLES ===================== */

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      paddingHorizontal: 20,
      marginBottom: 16,
    },

    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
    },

    roleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.primary}20`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },

    roleContent: {
      flex: 1,
    },

    roleTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 4,
    },

    roleSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
    },

    roleStats: {},

    roleCount: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
    },
  });
