import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext'; // Use your custom hook

interface SearchHistoryProps {
  history: string[];
  onSearchItemPress: (item: string) => void;
  onRemoveHistoryItem: (item: string) => void;
  onClearAllHistory: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSearchItemPress,
  onRemoveHistoryItem,
  onClearAllHistory,
}) => {
  const { colors } = useTheme(); // Destructure colors

  if (history.length === 0) return null;

  return (
    <View style={styles.historySection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Searches
        </Text>
        <TouchableOpacity onPress={onClearAllHistory}>
          <Text style={[styles.clearAllText, { color: colors.primary }]}>
            Clear all
          </Text>
        </TouchableOpacity>
      </View>
      
      {history.map((item, index) => (
        <View 
          key={index} 
          style={[styles.historyItem, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity
            style={styles.historyContent}
            onPress={() => onSearchItemPress(item)}
          >
            <Clock size={20} color={colors.textSecondary} />
            <Text style={[styles.historyText, { color: colors.text }]}>
              {item}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemoveHistoryItem(item)}
            style={styles.historyRemove}
          >
            <Text style={{ color: colors.textSecondary }}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  historySection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    flex: 1,
  },
  historyRemove: {
    padding: 4,
    paddingHorizontal: 8,
  },
});

export default SearchHistory;