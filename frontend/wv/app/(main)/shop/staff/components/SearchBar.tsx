// SearchBar.tsx
import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Search, X } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.searchContainer}>
      <Search size={20} color={colors.textSecondary} />

      <TextInput
        style={styles.searchInput}
        placeholder="Search staff members..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
          hitSlop={10}
        >
          <X size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ===================== STYLES ===================== */

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 12,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
      marginLeft: 12,
      fontFamily: "Inter_400Regular",
    },

    clearButton: {
      padding: 6,
    },
  });
