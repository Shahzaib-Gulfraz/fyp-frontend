// src/components/shop/ProductMetadataForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, TextInput, Chip, Button, HelperText } from 'react-native-paper';
import {
  Tag,
  Palette,
  Ruler,
  Hash,
  DollarSign,
  Package,
  Type,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import {
  ClothingCategory,
  ClothingSize,
  ShoeSize,
  ColorOption,
} from '@/src/types';

const CATEGORIES: { id: ClothingCategory; name: string; icon: string }[] = [
  { id: 't-shirts', name: 'T-Shirts', icon: '👕' },
  { id: 'shirts', name: 'Shirts', icon: '👔' },
  { id: 'pants', name: 'Pants', icon: '👖' },
  { id: 'jeans', name: 'Jeans', icon: '🧢' },
  { id: 'jackets', name: 'Jackets', icon: '🧥' },
  { id: 'hoodies', name: 'Hoodies', icon: '🧣' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'skirts', name: 'Skirts', icon: '🩳' },
  { id: 'shorts', name: 'Shorts', icon: '🩲' },
  { id: 'sweaters', name: 'Sweaters', icon: '🧶' },
  { id: 'activewear', name: 'Activewear', icon: '🏃' },
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'accessories', name: 'Accessories', icon: '👜' },
  { id: 'other', name: 'Other', icon: '📦' },
];

const CLOTHING_SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];
const SHOE_SIZES: ShoeSize[] = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'blue', name: 'Blue', hex: '#0000FF' },
  { id: 'green', name: 'Green', hex: '#008000' },
  { id: 'yellow', name: 'Yellow', hex: '#FFFF00' },
  { id: 'pink', name: 'Pink', hex: '#FFC0CB' },
  { id: 'purple', name: 'Purple', hex: '#800080' },
  { id: 'gray', name: 'Gray', hex: '#808080' },
  { id: 'navy', name: 'Navy', hex: '#000080' },
  { id: 'brown', name: 'Brown', hex: '#A52A2A' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
];

const ProductMetadataForm: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  // Form State
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<(ClothingSize | ShoeSize)[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isClothing, setIsClothing] = useState(true);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleColorSelect = (color: ColorOption) => {
    if (selectedColors.find(c => c.id === color.id)) {
      setSelectedColors(selectedColors.filter(c => c.id !== color.id));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleSizeSelect = (size: ClothingSize | ShoeSize) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = () => {
    if (!productName || !selectedCategory || selectedColors.length === 0 || selectedSizes.length === 0) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields');
      return;
    }

    const productData = {
      name: productName,
      brand,
      price: parseFloat(price) || 0,
      originalPrice: parseFloat(originalPrice) || 0,
      sku,
      description,
      materials,
      careInstructions,
      category: selectedCategory,
      colors: selectedColors,
      sizes: selectedSizes,
      tags,
      type: isClothing ? 'clothing' : 'shoes',
    };

    console.log('Product Data:', productData);
    Alert.alert('Success', 'Product saved successfully!');
  };

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[
        styles.sectionTitle,
        { 
          color: colors.text,
          fontFamily: fonts.semiBold,
          fontSize: 16,
          marginLeft: spacing.sm,
        }
      ]}>
        {title}
      </Text>
    </View>
  );

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <Card style={[
        styles.card,
        { 
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          margin: spacing.md,
        }
      ]}>
        <Card.Content>
          {renderSectionHeader(<Type size={20} color={colors.primary} />, 'Basic Information')}
          
          <TextInput
            label="Product Name *"
            value={productName}
            onChangeText={setProductName}
            mode="outlined"
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
              }
            ]}
            theme={{ colors: { primary: colors.primary } }}
          />

          <TextInput
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            mode="outlined"
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
              }
            ]}
          />

          <View style={styles.priceRow}>
            <TextInput
              label="Price *"
              value={price}
              onChangeText={setPrice}
              mode="outlined"
              keyboardType="decimal-pad"
              style={[
                styles.priceInput,
                { 
                  backgroundColor: colors.background,
                  marginBottom: spacing.sm,
                }
              ]}
              left={<TextInput.Affix text="$" />}
            />
            <TextInput
              label="Original Price"
              value={originalPrice}
              onChangeText={setOriginalPrice}
              mode="outlined"
              keyboardType="decimal-pad"
              style={[
                styles.priceInput,
                { 
                  backgroundColor: colors.background,
                  marginBottom: spacing.sm,
                }
              ]}
              left={<TextInput.Affix text="$" />}
            />
          </View>

          {renderSectionHeader(<Tag size={20} color={colors.primary} />, 'Category & Type')}
          
          {/* Type Selector */}
          <View style={[styles.typeSelector, { marginBottom: spacing.md }]}>
            <TouchableOpacity
              onPress={() => setIsClothing(true)}
              style={[
                styles.typeButton,
                { 
                  backgroundColor: isClothing ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  marginRight: spacing.sm,
                }
              ]}
            >
              <Text style={[
                styles.typeButtonText,
                { 
                  color: isClothing ? colors.background : colors.text,
                  fontFamily: isClothing ? fonts.semiBold : fonts.regular,
                }
              ]}>
                👕 Clothing
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setIsClothing(false)}
              style={[
                styles.typeButton,
                { 
                  backgroundColor: !isClothing ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                }
              ]}
            >
              <Text style={[
                styles.typeButtonText,
                { 
                  color: !isClothing ? colors.background : colors.text,
                  fontFamily: !isClothing ? fonts.semiBold : fonts.regular,
                }
              ]}>
                👟 Shoes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories Grid */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: selectedCategory === category.id 
                      ? colors.primary + '15' 
                      : colors.surface,
                    borderColor: selectedCategory === category.id 
                      ? colors.primary 
                      : colors.border,
                    borderRadius: radius.md,
                    marginRight: spacing.sm,
                  }
                ]}
              >
                <Text style={[
                  styles.categoryEmoji,
                  { fontSize: 24 }
                ]}>
                  {category.icon}
                </Text>
                <Text style={[
                  styles.categoryName,
                  { 
                    color: selectedCategory === category.id 
                      ? colors.primary 
                      : colors.text,
                    fontFamily: selectedCategory === category.id 
                      ? fonts.semiBold 
                      : fonts.regular,
                    marginTop: spacing.xs,
                  }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderSectionHeader(<Palette size={20} color={colors.primary} />, 'Colors *')}
          
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map(color => {
              const isSelected = selectedColors.find(c => c.id === color.id);
              const isLightColor = ['white', 'yellow', 'pink', 'beige'].includes(color.id);
              
              return (
                <TouchableOpacity
                  key={color.id}
                  onPress={() => handleColorSelect(color)}
                  style={[
                    styles.colorButton,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                      borderRadius: radius.sm,
                    }
                  ]}
                >
                  <View style={[
                    styles.colorSwatch,
                    { 
                      backgroundColor: color.hex,
                      borderColor: isLightColor ? colors.border : 'transparent',
                      borderWidth: isLightColor ? 1 : 0,
                    }
                  ]} />
                  <Text style={[
                    styles.colorName,
                    { 
                      color: colors.text,
                      fontFamily: fonts.regular,
                      fontSize: 11,
                      marginTop: 2,
                    }
                  ]}>
                    {color.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {renderSectionHeader(<Ruler size={20} color={colors.primary} />, 'Sizes *')}
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sizesScroll}
          >
            {(isClothing ? CLOTHING_SIZES : SHOE_SIZES).map(size => (
              <TouchableOpacity
                key={size}
                onPress={() => handleSizeSelect(size)}
                style={[
                  styles.sizeButton,
                  { 
                    backgroundColor: selectedSizes.includes(size) 
                      ? colors.primary 
                      : colors.surface,
                    borderColor: selectedSizes.includes(size) 
                      ? colors.primary 
                      : colors.border,
                    borderRadius: radius.sm,
                    marginRight: spacing.sm,
                  }
                ]}
              >
                <Text style={[
                  styles.sizeText,
                  { 
                    color: selectedSizes.includes(size) 
                      ? colors.background 
                      : colors.text,
                    fontFamily: selectedSizes.includes(size) 
                      ? fonts.semiBold 
                      : fonts.medium,
                  }
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderSectionHeader(<Hash size={20} color={colors.primary} />, 'Product Details')}
          
          <TextInput
            label="SKU (Stock Keeping Unit)"
            value={sku}
            onChangeText={setSku}
            mode="outlined"
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
              }
            ]}
          />

          <TextInput
            label="Materials (e.g., Cotton 80%, Polyester 20%)"
            value={materials}
            onChangeText={setMaterials}
            mode="outlined"
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
              }
            ]}
          />

          <TextInput
            label="Care Instructions"
            value={careInstructions}
            onChangeText={setCareInstructions}
            mode="outlined"
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
              }
            ]}
          />

          {renderSectionHeader(<FileText size={20} color={colors.primary} />, 'Description & Tags')}
          
          <TextInput
            label="Product Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              { 
                backgroundColor: colors.background,
                marginBottom: spacing.sm,
                minHeight: 100,
              }
            ]}
          />

          <View style={styles.tagsContainer}>
            <TextInput
              label="Add Tags"
              value={tagInput}
              onChangeText={setTagInput}
              mode="outlined"
              onSubmitEditing={handleAddTag}
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  marginBottom: spacing.sm,
                }
              ]}
              right={<TextInput.Icon icon="plus" onPress={handleAddTag} />}
            />
            
            <View style={styles.tagsList}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  mode="outlined"
                  onClose={() => handleRemoveTag(tag)}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: colors.surface,
                      marginRight: spacing.xs,
                      marginBottom: spacing.xs,
                    }
                  ]}
                  textStyle={{ color: colors.text, fontFamily: fonts.regular }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              { 
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                marginTop: spacing.lg,
              }
            ]}
            labelStyle={[
              styles.submitButtonText,
              { 
                color: colors.background,
                fontFamily: fonts.semiBold,
                fontSize: 16,
              }
            ]}
          >
            Save Product
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  colorName: {
    fontSize: 11,
    marginTop: 2,
  },
  sizesScroll: {
    marginBottom: 16,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  submitButton: {
    paddingVertical: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductMetadataForm;