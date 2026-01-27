import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '@/src/api';
import { useAuth } from '@/src/context/AuthContext';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, icon, colors, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.9}>
        <LinearGradient colors={colors} style={styles.statGradient}>
            <View style={styles.statIconContainer}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

export default function AdminDashboard() {
    const router = useRouter();
    const { setAuthenticated, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchStats();
    };

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to logout?");
            if (confirmed) {
                await logout();
                router.replace('/(auth)/login');
            }
            return;
        }

        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Admin Panel</Text>
                    <Text style={styles.dateText}>Platform Overview</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon="people"
                        colors={['#4facfe', '#00f2fe']}
                        onPress={() => router.push('/(admin)/user-management')}
                    />
                    <StatCard
                        title="Total Shops"
                        value={stats?.totalShops || 0}
                        icon="storefront"
                        colors={['#667eea', '#764ba2']}
                        onPress={() => router.push('/(admin)/shop-management')}
                    />
                    <StatCard
                        title="Pending Shops"
                        value={stats?.pendingShops || 0}
                        icon="time"
                        colors={['#f093fb', '#f5576c']}
                        onPress={() => router.push('/(admin)/shop-management')}
                    />
                    <StatCard
                        title="Total Products"
                        value={stats?.totalProducts || 0}
                        icon="shirt"
                        colors={['#43e97b', '#38f9d7']}
                        onPress={() => router.push('/(admin)/product-management')}
                    />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => router.push('/(admin)/shop-management')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                        </View>
                        <Text style={styles.actionText}>Approve Shops</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => router.push('/(admin)/product-management')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="ban" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.actionText}>Manage Listings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => router.push('/(admin)/categories')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E1F5FE' }]}>
                            <Ionicons name="grid" size={24} color="#039BE5" />
                        </View>
                        <Text style={styles.actionText}>Manage Categories</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => router.push('/(admin)/banners')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                            <Ionicons name="images" size={24} color="#9C27B0" />
                        </View>
                        <Text style={styles.actionText}>Manage Banners</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    logoutButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#FFF0F0',
    },
    scrollContent: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 50) / 2,
        height: 120,
        marginBottom: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statGradient: {
        flex: 1,
        padding: 15,
        justifyContent: 'space-between',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    statTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 15,
    },
    actionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});
