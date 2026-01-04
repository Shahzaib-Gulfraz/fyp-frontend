import React from "react";
import { View, Text,  StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";

interface TryOnHeaderProps {
  title: string;
  onBack: () => void;
}

const TryOnHeader: React.FC<TryOnHeaderProps> = ({ title, onBack }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* Title */}
      <View style={styles.leftSection}>
        

        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default TryOnHeader;


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

  title: {
    fontSize: 22,
    fontWeight: "700",
  },
});
