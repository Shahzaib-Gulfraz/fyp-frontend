import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import shopService from '@/src/api/shopService';

export default function MyShopProfileScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyShop();
    }, []);

    const loadMyShop = async () => {
        try {
            setLoading(true);
            const data = await shopService.getMyShop();
            setShop(data.shop || data);
        } catch (error) {
            console.error('Failed to load my shop:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!shop) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centered}>
                    <Text style={[styles.text, { color: colors.text }]}>Shop data not available</Text>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.buttonText, { color: colors.background }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>My Shop</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Shop Name</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{shop.shopName}</Text>

                    <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Email</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{shop.email}</Text>

                    <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>City</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{shop.city || 'N/A'}</Text>

                    <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Followers</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{shop.followersCount || 0}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
