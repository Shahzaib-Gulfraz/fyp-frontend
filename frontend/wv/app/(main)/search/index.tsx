import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import SearchHeader from './components/SearchHeader';
import SearchHistory from './components/SearchHistory';
import ProductGrid from './components/ProductGrid';
import NoResults from './components/NoResults';
import SearchTabs from './components/SearchTabs';

// Mock product data (Instagram-style grid)
const mockProducts = [
  { id: '1', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
  { id: '2', type: 'video', mediaUrl: 'https://images.unsplash.com/photo-1539109132381-315125aed5ea?w=400' },
  { id: '3', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1434389677669-e08b46e81044?w=400' },
  { id: '4', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400' },
  { id: '5', type: 'video', mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
  { id: '6', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
  { id: '7', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
  { id: '8', type: 'video', mediaUrl: 'https://images.unsplash.com/photo-1539109132381-315125aed5ea?w=400' },
  { id: '9', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1434389677669-e08b46e81044?w=400' },
];

type TabType = 'all' | 'shops' | 'products';

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState(mockProducts);
  const [searchHistory, setSearchHistory] = useState([
    'Summer dresses', 'Denim jackets', 'White sneakers', 'Leather bags',
    'Oversized t-shirts', 'Cargo pants', 'Platform shoes'
  ]);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarRef = useRef<any>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults(mockProducts);
    } else {
      const filtered = mockProducts.filter(
        item => item.type.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);

      if (!searchHistory.includes(query) && query.trim() !== '') {
        setSearchHistory(prev => [query, ...prev.slice(0, 7)]);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(mockProducts);
  };

  const handleBackPress = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Search Header */}
      <SearchHeader
        ref={searchBarRef}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onClearSearch={clearSearch}
        onBackPress={handleBackPress}
        onSearchFocus={handleSearchFocus}
        showBackButton={isSearchActive}
      />

      {/* Main Content */}
      {isSearchActive ? (
        // Search Results View
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search History (only show when no query and search is active) */}
          {searchQuery === '' && searchHistory.length > 0 && (
            <SearchHistory
              history={searchHistory}
              onSearchItemPress={(item) => {
                setSearchQuery(item);
                handleSearch(item);
              }}
              onRemoveHistoryItem={item => setSearchHistory(prev => prev.filter(h => h !== item))}
              onClearAllHistory={() => setSearchHistory([])}
            />
          )}

          {/* Search Tabs (show when query is not empty) */}
          {searchQuery !== '' && (
            <SearchTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* Search Results Grid */}
          {searchQuery !== '' && searchResults.length > 0 && (
            <ProductGrid products={searchResults} />
          )}

          {/* No Results */}
          {searchQuery !== '' && searchResults.length === 0 && (
            <NoResults />
          )}
        </ScrollView>
      ) : (
        // Explore/Home View (Instagram-style grid)
        <>
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            contentContainerStyle={styles.exploreContent}
          >
            {/* Popular Categories Section */}
            <View style={styles.categoriesSection}>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {['Trending', 'Summer', 'Streetwear', 'Minimal', 'Vintage', 'Luxury', 'Sports'].map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: index === 0 ? colors.primary : colors.surface,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => {
                      setSearchQuery(cat);
                      setIsSearchActive(true);
                    }}
                  >
                    <Text style={[
                      styles.categoryText,
                      { color: index === 0 ? colors.background : colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Explore Grid */}
            <ProductGrid products={mockProducts} />
          </Animated.ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  exploreContent: {
    paddingBottom: 100,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});