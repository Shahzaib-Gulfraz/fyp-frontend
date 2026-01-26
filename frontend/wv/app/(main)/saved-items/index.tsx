import React, { useState, useEffect } from 'react';
import { ScrollView, FlatList, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Trash2 } from 'lucide-react-native';
import SavedItemsHeader from './components/SavedItemHeader';
import SavedItemCard from './components/SavedItemCard';
import EmptySavedState from './components/EmptySavedState';
import savedItemService from '@/src/api/savedItemService';

const SavedItemsScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'clothing' | 'accessories'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      setLoading(true);
      const response = await savedItemService.getSavedItems();
      console.log('Saved items response:', response);
      
      if (response?.success && response?.data) {
        // Map backend data to UI format
        const items = response.data.map((saved: any) => {
          const product = saved.product || saved.productId;
          return {
            id: saved._id,
            productId: product._id,
            name: product.name,
            brand: product.brand || 'WearVirtually',
            price: product.price,
            image: product.thumbnail?.url || product.images?.[0]?.url || 'https://placehold.co/400x400',
            category: product.category?.name?.toLowerCase() === 'accessories' ? 'accessories' : 'clothing',
            rating: product.stats?.rating || 4.0,
            description: product.description
          };
        });
        setSavedItems(items);
      } else {
        setSavedItems([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch saved items:', error);
      console.error('Error response:', error.response?.data);
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Delete from backend
      await Promise.all(selectedItems.map(id => savedItemService.removeSavedItem(id)));
      // Refresh list
      await fetchSavedItems();
      setSelectedItems([]);
      setIsSelecting(false);
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await savedItemService.removeSavedItem(id);
      await fetchSavedItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleTryOn = (productId: string) => {
    // Navigate to try-on with the product
    const item = savedItems.find(i => i.productId === productId);
    if (item) {
      router.push({
        pathname: '/(main)/try-on',
        params: { product: JSON.stringify(item) }
      });
    }
  };

  const handleShop = (item: any) => {
    router.push(`/buy/${item.productId}`);
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : savedItems.length === 0 ? (
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