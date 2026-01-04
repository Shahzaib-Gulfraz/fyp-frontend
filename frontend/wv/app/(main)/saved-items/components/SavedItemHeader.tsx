import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface SavedItemsHeaderProps {
  title: string;
  totalCount: number;
  selectedCount: number;
  onBack: () => void;
  isSelecting: boolean;
  onSelectModeToggle: () => void;
  onCancelSelection: () => void;
  onDeleteSelected: () => void;
}


const SavedItemsHeader: React.FC<SavedItemsHeaderProps> = ({
  title,
  totalCount,
  selectedCount,
  onBack,
  isSelecting,
  onSelectModeToggle,
  onCancelSelection,
  onDeleteSelected,
}) => {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  const logoSource = isDark
    ? require("@/assets/images/logo-light.png")
    : require("@/assets/images/logo-dark.png");

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* LEFT: Back + Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      {/* RIGHT: Logo + Count Badge */}
      <View style={styles.logoWrapper}>
        <Image
          source={logoSource}
          style={[styles.logo, { tintColor: colors.text }]}
          resizeMode="contain"
        />

        {totalCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
              },
            ]}
          >
            <Text style={styles.badgeText}>{totalCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SavedItemsHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  logoWrapper: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 26,
    height: 26,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
