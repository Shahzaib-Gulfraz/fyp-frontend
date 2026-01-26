import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { productService } from '@/src/api';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { category } = useLocalSearchParams();

  useEffect(() => {
    if (category) {
      setSelectedCategory(category as string);
    }
  }, [category]);

  // Backend data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response && response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const params: any = {};

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await productService.getProducts(params);
        if (response && response.products) {
          setProducts(response.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory);

  // Get subcategories from category attributes
  const getSubcategories = () => {
    if (!selectedCategoryData || !selectedCategoryData.attributes) return [];

    // Look for attributes that might contain subcategories
    for (const attr of selectedCategoryData.attributes) {
      if (attr.type === 'select' && attr.options && attr.options.length > 0) {
        // Return first select attribute with options as potential subcategories
        return attr.options;
      }
    }
    return [];
  };

  const subcategories = getSubcategories();

  // Filter products by subcategory on frontend
  const filteredProducts = selectedSubcategory
    ? products.filter(p => {
      // Check if any specification matches the subcategory
      if (p.specifications) {
        return Object.values(p.specifications).some(
          (val: any) => val === selectedSubcategory
        );
      }
      return false;
    })
    : products;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.text + '80'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text + '60'} />
            </TouchableOpacity>
          )}
        </View>
        {(selectedCategory || selectedSubcategory || searchQuery) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category._id
                      ? colors.primary
                      : colors.surface,
                    borderColor: selectedCategory === category._id
                      ? colors.primary
                      : colors.border
                  }
                ]}
                onPress={() => handleCategorySelect(category._id)}
              >
                <Text style={styles.categoryIcon}>{category.icon || '📦'}</Text>
                <Text style={[
                  styles.categoryName,
                  { color: selectedCategory === category._id ? '#fff' : colors.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subcategories (show only when category is selected) */}
        {selectedCategoryData && subcategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCategoryData.name}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoriesScroll}
            >
              {subcategories.map((subcategory: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryPill,
                    {
                      backgroundColor: selectedSubcategory === subcategory
                        ? colors.primary
                        : 'transparent',
                      borderColor: colors.primary
                    }
                  ]}
                  onPress={() => handleSubcategorySelect(subcategory)}
                >
                  <Text style={[
                    styles.subcategoryText,
                    { color: selectedSubcategory === subcategory ? '#fff' : colors.primary }
                  ]}>
                    {subcategory}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          {productsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.resultsCount, { color: colors.text }]}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
            </Text>
          )}
        </View>

        {/* Product Grid */}
        {!productsLoading && filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <TouchableOpacity
                key={product._id}
                style={[styles.productCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/buy/${product._id}`)}
              >
                <Image
                  source={{ uri: product.thumbnail?.url || 'https://placehold.co/400x400/png?text=No+Image' }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      Rs. {product.price}
                    </Text>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                        {product.stats?.rating || 4.0}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.text + '30'} />
            <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
              No products found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}>
              Try adjusting your filters or search query
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoriesScroll: {
    paddingHorizontal: 20,
  },
  subcategoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1.5,
  },
  subcategoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 36,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});