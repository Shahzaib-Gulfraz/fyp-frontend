import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '@/src/api';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFD93D', '#6C5CE7', '#A8E6CF'];

export const CategoryRail = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getCategories();
                if (data && data.categories) {
                    setCategories(data.categories);
                } else if (data && data.success && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading || categories.length === 0) {
        return null; // Or a skeleton loader
    }

    const renderIcon = (icon: string, color: string) => {
        // If icon is an emoji (simple heuristic: default is '📦'), render text
        // Or if it's a short string likely to be an emoji
        const isEmoji = !icon || icon === '📦' || icon.match(/\p{Emoji}/u);

        if (isEmoji) {
            return <Text style={{ fontSize: 24 }}>{icon || '📦'}</Text>;
        }

        // valid icon names usually 'shirt-outline' etc.
        return <Ionicons name={icon as any} size={24} color={color} />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
                <TouchableOpacity onPress={() => router.push('/(main)/search')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((cat, index) => {
                    const color = COLORS[index % COLORS.length];
                    return (
                        <TouchableOpacity
                            key={cat._id || index}
                            style={styles.itemContainer}
                            onPress={() => router.push({ pathname: '/(main)/search', params: { category: cat._id } })}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                                {renderIcon(cat.icon, color)}
                            </View>
                            <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 15,
    },
    itemContainer: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    }
});
