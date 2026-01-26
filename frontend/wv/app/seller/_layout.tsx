import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    MessageCircle,
    Store,
    Settings
} from 'lucide-react-native';

export default function SellerLayout() {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const { isAuthenticated, userType, isLoading } = useAuth();
    const router = useRouter();

    // Route protection: redirect if not authenticated or not a shop
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                console.log('[SellerLayout] Not authenticated, redirecting to login');
                router.replace('/(auth)/login');
            } else if (userType !== 'shop') {
                console.log('[SellerLayout] Not a shop user, redirecting to home');
                router.replace('/(main)/home');
            }
        }
    }, [isAuthenticated, userType, isLoading]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Don't render tabs if not authorized
    if (!isAuthenticated || userType !== 'shop') {
        return null;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                    paddingTop: 12,
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    href: "/seller/dashboard",
                    title: "Overview",
                    tabBarIcon: ({ color, size }) => (
                        <LayoutDashboard size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    href: "/seller/orders",
                    title: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <ShoppingBag size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    href: "/seller/products",
                    title: "Products",
                    tabBarIcon: ({ color, size }) => (
                        <Package size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    href: "/seller/messages",
                    title: "Chats",
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <MessageCircle size={size} color={color} />
                            {/* Badge could go here */}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: "/seller/profile",
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Store size={size} color={color} />
                    ),
                }}
            />

            {/* Hidden Screens (not in tab bar) */}
            <Tabs.Screen
                name="storefront"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="returns"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
