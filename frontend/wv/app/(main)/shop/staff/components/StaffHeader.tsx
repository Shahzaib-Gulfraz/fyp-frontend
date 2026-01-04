import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft, UserPlus } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface StaffHeaderProps {
  onAddPress: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ onAddPress }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Navigate to shop/dashboard */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/shop/dashboard")}
          activeOpacity={0.8}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>Manage Staff</Text>

        {/* Add Staff */}
        <TouchableOpacity
          style={[styles.iconButton, styles.addButton]}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <UserPlus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
  });
