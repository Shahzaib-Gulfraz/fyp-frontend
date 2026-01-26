// src/components/shop/CatalogSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { Search, Filter, Grid, List } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import ProductCardItem from './ProductCardItem';
import { useRouter } from 'expo-router';
import { MOCK_CLOTHING_ITEMS } from '../data/mockData';

import { productService } from '@/src/api/productService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ActivityIndicator } from 'react-native';

interface CatalogSectionProps {
  onEditProduct: (product: any) => void;
}

const CatalogSection: React.FC<CatalogSectionProps> = ({ onEditProduct }) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const shopData = await AsyncStorage.getItem('shop');
      if (shopData) {
        const { _id } = JSON.parse(shopData);
        const data = await productService.getShopProducts(_id);
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', 'T-Shirts', 'Shirts', 'Pants', 'Jeans', 'Jackets', 'Dresses', 'Shoes'];

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && selectedCategory !== 'All' && product.category !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      try {
        console.log('F-DEBUG: Deleting product:', id);
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        if (Platform.OS === 'web') {
          alert('Product deleted successfully');
        } else {
          Alert.alert('Success', 'Product deleted successfully');
        }
      } catch (error) {
        console.error('Delete error:', error);
        if (Platform.OS === 'web') {
          alert('Failed to delete product');
        } else {
          Alert.alert('Error', 'Failed to delete product');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this product?');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete
          }
        ]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[
        styles.title,
        {
          color: colors.text,
          fontFamily: fonts.bold,
          fontSize: 26,
          marginBottom: spacing.lg,
          letterSpacing: 0.3,
        }
      ]}>
        Product Catalog
      </Text>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginBottom: spacing.md,
        }
      ]}>
        <Search size={20} color={colors.textTertiary} />
        <TextInput
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            {
              color: colors.text,
              fontFamily: fonts.regular,
              flex: 1,
              marginLeft: spacing.sm,
            }
          ]}
          placeholderTextColor={colors.textTertiary}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.primary + '10',
              borderRadius: radius.sm,
            }
          ]}
        >
          <Filter size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category === 'All' ? null : category)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category ||
                  (category === 'All' && selectedCategory === null)
                  ? colors.primary
                  : colors.surface,
                borderColor: colors.border,
                borderRadius: radius.full,
                marginRight: spacing.sm,
              }
            ]}
          >
            <Text style={[
              styles.categoryButtonText,
              {
                color: selectedCategory === category ||
                  (category === 'All' && selectedCategory === null)
                  ? colors.background
                  : colors.text,
                fontFamily: fonts.medium,
              }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Toggle */}
      <View style={[styles.viewToggle, { marginTop: spacing.md, marginBottom: spacing.lg }]}>
        <Text style={[
          styles.totalText,
          {
            color: colors.textSecondary,
            fontFamily: fonts.regular,
            fontSize: 14,
          }
        ]}>
          {filteredProducts.length} products
        </Text>

        <View style={styles.viewButtons}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[
              styles.viewButton,
              {
                backgroundColor: viewMode === 'grid' ? colors.primary + '15' : colors.surface,
                borderColor: colors.border,
                borderRadius: radius.sm,
                marginRight: spacing.sm,
              }
            ]}
          >
            <Grid size={18} color={viewMode === 'grid' ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[
              styles.viewButton,
              {
                backgroundColor: viewMode === 'list' ? colors.primary + '15' : colors.surface,
                borderColor: colors.border,
                borderRadius: radius.sm,
              }
            ]}
          >
            <List size={18} color={viewMode === 'list' ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <View style={{ flex: 1, maxWidth: viewMode === 'grid' ? '50%' : '100%' }}>
      <ProductCardItem
        viewMode={viewMode}
        product={{
        id: item._id,
        name: item.name,
        brand: item.brand || 'No Brand',
        price: `$${item.price}`,
        category: item.category,
        subcategory: item.subcategory,
        image: item.thumbnail?.url || 'https://placehold.co/400x600',
        sizes: item.sizes || [],
        colors: item.colors || [],
        rating: item.stats?.rating || 0,
        reviews: item.stats?.reviewsCount || 0,
        isLiked: false,
        description: item.description,
        materials: item.material,
        care: item.careInstructions
        }}
        onEdit={() => onEditProduct(item)}
        onDelete={() => handleDelete(item._id)}
        onPreview={() => {
          const productForPreview = {
            id: item._id,
            name: item.name,
            brand: item.brand || 'No Brand',
            price: `$${item.price}`,
            category: item.category,
            subcategory: item.subcategory,
            image: item.thumbnail?.url || 'https://placehold.co/400x600',
            sizes: item.sizes || [],
            colors: item.colors || [],
            rating: item.stats?.rating || 0,
            reviews: item.stats?.reviewsCount || 0,
            isLiked: false,
            description: item.description,
            materials: item.material,
            care: item.careInstructions
          };
          router.push({
            pathname: '/(main)/try-on',
            params: { product: JSON.stringify(productForPreview) }
          });
        }}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <FlatList
        key={viewMode}
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: spacing.md, paddingBottom: spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchProducts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 14,
  },
  viewButtons: {
    flexDirection: 'row',
  },
  viewButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default CatalogSection;