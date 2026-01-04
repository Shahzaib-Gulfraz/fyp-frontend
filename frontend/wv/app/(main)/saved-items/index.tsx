import React, { useState } from 'react';
import { ScrollView, FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Trash2 } from 'lucide-react-native';
import SavedItemsHeader from './components/SavedItemHeader';
import SavedItemCard from './components/SavedItemCard';
import EmptySavedState from './components/EmptySavedState';
import { MOCK_SAVED_ITEMS } from './constants/mockData';

const SavedItemsScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [savedItems, setSavedItems] = useState(MOCK_SAVED_ITEMS);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'clothing' | 'accessories'>('all');

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = () => {
    setSavedItems(savedItems.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const handleDeleteItem = (id: string) => {
    setSavedItems(savedItems.filter(item => item.id !== id));
  };

  const handleTryOn = (id: string) => {
    router.push(`/(main)/try-on/${id}`);
  };

  const handleShop = (item: any) => {
    // Navigate to shop or product page
    router.push(`/(main)/product/${item.id}`);
  };

  // Filter items based on active tab
  const filteredItems = activeTab === 'all'
    ? savedItems
    : savedItems.filter(item => item.category === activeTab);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <SavedItemsHeader
        title="Saved Items"
        totalCount={savedItems.length}
        selectedCount={selectedItems.length}
        onBack={() => router.back()}
        isSelecting={isSelecting}
        onSelectModeToggle={() => setIsSelecting(!isSelecting)}
        onCancelSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
      />

      {savedItems.length === 0 ? (
        <EmptySavedState onExplore={() => router.push('/(main)/home')} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Saved Count & Select Mode Indicator */}
          <View style={styles.topSection}>
            

            {isSelecting && (
              <View style={styles.selectIndicator}>
                <Text style={[styles.selectIndicatorText, { color: colors.textSecondary }]}>
                  Tap items to select • {selectedItems.length} selected
                </Text>
              </View>
            )}
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsContainer}>
            {['all', 'clothing', 'accessories'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text
                  style={[
                    styles.tab,
                    { color: colors.textSecondary },
                    activeTab === tab && [
                      styles.activeTab,
                      { color: colors.primary, borderBottomColor: colors.primary }
                    ]
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
              <SavedItemCard
                item={item}
                isSelecting={isSelecting}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelectItem}
                onTryOn={handleTryOn}
                onDelete={handleDeleteItem}
                onShop={() => handleShop(item)}
              />
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />

        </ScrollView>
      )}

      {/* Delete Selected FAB */}
      {isSelecting && selectedItems.length > 0 && (
        <View style={[styles.fabContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fabCount, { color: colors.text }]}>
            {selectedItems.length} selected
          </Text>
          <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteSelected}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.fabText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  selectIndicatorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    marginRight: 24,
    paddingBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTab: {
    borderBottomWidth: 2,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  fabCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SavedItemsScreen;