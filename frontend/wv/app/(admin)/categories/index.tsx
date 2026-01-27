import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Text, FAB, Card, Searchbar, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { productService } from '@/src/api/productService';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import CategoryFormModal from './components/CategoryFormModal';

const AdminCategoriesScreen = () => {
    const { colors, isDark } = useTheme();
    const { spacing, fonts } = appTheme.tokens;
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    const fetchCategories = async () => {
        try {
            const data = await (productService as any).getCategories();
            if (data && data.categories) {
                setCategories(data.categories);
                setFilteredCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = categories;

        // Filter by Type
        if (selectedType) {
            result = result.filter(cat => cat.type === selectedType);
        }

        // Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(cat =>
                cat.name.toLowerCase().includes(lowerQuery) ||
                cat.slug.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredCategories(result);
    }, [categories, searchQuery, selectedType]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await (productService as any).deleteCategory(id);
                            fetchCategories();
                            Alert.alert('Success', 'Category deleted successfully');
                        } catch {
                            Alert.alert('Error', 'Failed to delete category');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setModalVisible(true);
    };

    const getUniqueTypes = () => {
        const types = new Set(categories.map(c => c.type));
        return Array.from(types);
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            {/* Header with Back Button */}
            <View style={[styles.header, { 
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
            }]}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ArrowLeft size={24} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                <View style={styles.headerTitleSection}>
                    <Text style={[styles.title, { 
                        color: colors.text, 
                        fontFamily: fonts.bold,
                        fontSize: 28,
                    }]}>
                        Categories
                    </Text>
                    <Text style={[styles.subtitle, { 
                        color: colors.textSecondary,
                        fontFamily: fonts.regular,
                        fontSize: 13,
                        marginTop: 4,
                    }]}>
                        {categories.length} total
                    </Text>
                </View>
            </View>

            <View style={styles.filterSection}>
                <Searchbar
                    placeholder="Search categories..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.surface }]}
                    inputStyle={{ color: colors.text }}
                />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                    <Chip
                        selected={selectedType === null}
                        onPress={() => setSelectedType(null)}
                        style={styles.chip}
                    >
                        All
                    </Chip>
                    {getUniqueTypes().map(type => (
                        <Chip
                            key={type}
                            selected={selectedType === type}
                            onPress={() => setSelectedType(type)}
                            style={styles.chip}
                        >
                            {type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'Unknown'}
                        </Chip>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredCategories.map((category) => (
                    <Card key={category._id} style={[styles.card, { backgroundColor: colors.surface }]}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={styles.icon}>{category.icon || '📦'}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>{category.name}</Text>
                                    <Text style={{ color: colors.text + '80' }}>
                                        {category.type?.charAt(0).toUpperCase() + category.type?.slice(1)} • {category.attributes?.length || 0} Attributes
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardActions}>
                                <IconButton icon="pencil" size={20} onPress={() => handleEdit(category)} />
                                <IconButton icon="delete" size={20} iconColor={colors.error} onPress={() => handleDelete(category._id, category.name)} />
                            </View>
                        </Card.Content>
                    </Card>
                ))}
                {filteredCategories.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text + '80' }}>No categories found.</Text>
                )}
            </ScrollView>

            <FAB
                style={[styles.fab, { backgroundColor: colors.primary }]}
                icon="plus"
                color="white"
                onPress={handleAdd}
                label="Add Category"
            />

            <CategoryFormModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onSubmit={() => { setModalVisible(false); fetchCategories(); }}
                category={editingCategory}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        marginTop: 20,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
    },
    headerTitleSection: {
        flex: 1,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    filterSection: { paddingHorizontal: 20, marginBottom: 10 },
    searchBar: { marginBottom: 10, elevation: 0 },
    typeScroll: { flexDirection: 'row' },
    chip: { marginRight: 8 },
    listContent: { padding: 20, paddingBottom: 80 },
    card: { marginBottom: 12, elevation: 2 },
    cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    icon: { fontSize: 24 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    cardActions: { flexDirection: 'row' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default AdminCategoriesScreen;
