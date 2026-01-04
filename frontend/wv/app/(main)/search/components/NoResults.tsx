import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

interface NoResultsProps {
  title?: string;
  message?: string;
}

const NoResults: React.FC<NoResultsProps> = ({
  title = "No results found",
  message = "Try searching for something else",
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.noResults}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Search size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.noResultsTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noResultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default NoResults;