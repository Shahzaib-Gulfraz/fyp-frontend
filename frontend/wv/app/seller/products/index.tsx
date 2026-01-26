import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

export default function ProductsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>Products Inventory</Text>
                <Text style={{ marginTop: 8, color: colors.textSecondary }}>Manage your inventory here.</Text>

                <TouchableOpacity
                    style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        padding: 12,
                        borderRadius: 8,
                        alignSelf: 'flex-start'
                    }}
                    onPress={() => router.push('/seller/products/add')}
                >
                    <Plus color="white" size={20} />
                    <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Add New Product</Text>
                </TouchableOpacity>

                {/* Placeholder for list */}
                <View style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>Coming Soon: Full Inventory List</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
