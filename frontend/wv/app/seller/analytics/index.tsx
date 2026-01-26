import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react-native';

export default function AnalyticsScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
                <Text style={{ color: colors.textSecondary }}>Detailed insights coming soon.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <TrendingUp size={24} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Total Revenue</Text>
                    </View>
                    <Text style={[styles.cardValue, { color: colors.text }]}>$12,458</Text>
                    <Text style={{ color: '#4CAF50' }}>+12.5% vs last month</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <Users size={24} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Profile Visits</Text>
                    </View>
                    <Text style={[styles.cardValue, { color: colors.text }]}>2.1K</Text>
                    <Text style={{ color: '#4CAF50' }}>+5.3% vs last month</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { padding: 16 },
    card: { padding: 20, borderRadius: 12, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
    cardValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
});
