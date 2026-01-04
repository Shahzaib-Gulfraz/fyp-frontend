// src/screens/shop/ShopDashboard.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  Bell,
  Truck,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

import Header from './Header';
import StatCard from './StatCard';
import QuickActionCard from './QuickActionCard';
import ManagementItem from './ManagementItem';
import RecentOrderCard from './RecentOrderCard';

const ShopDashboard: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { spacing } = appTheme.tokens;
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const recentOrders = [
    {
      id: 'ORD-7890',
      customerName: 'Emma Wilson',
      productName: 'Premium Leather Jacket',
      productImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
      price: '$249.99',
      status: 'processing',
      date: 'Just now',
    },
    {
      id: 'ORD-7889',
      customerName: 'Michael Chen',
      productName: 'White Sneakers',
      productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
      price: '$129.99',
      status: 'shipped',
      date: '2 hours ago',
    },
    {
      id: 'ORD-7888',
      customerName: 'Sarah Johnson',
      productName: 'Summer Floral Dress',
      productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
      price: '$89.99',
      status: 'delivered',
      date: 'Yesterday',
    },
    {
      id: 'ORD-7887',
      customerName: 'David Lee',
      productName: 'Denim Jacket',
      productImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
      price: '$79.99',
      status: 'pending',
      date: 'Dec 5',
    },
  ];

  const lowStockProducts = [
    { name: 'Black Evening Dress', stock: 2, threshold: 10 },
    { name: 'Leather Boots', stock: 5, threshold: 15 },
    { name: 'Silk Blouse', stock: 8, threshold: 12 },
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'List new item for sale',
      icon: <Plus />,
      iconColor: '#4CAF50',
      badge: 'NEW',
      route: '/shop/add-product',
    },
    {
      title: 'View Analytics',
      description: 'Detailed sales reports',
      icon: <BarChart3 />,
      iconColor: '#2196F3',
      route: '/shop/analytics',
    },
    {
      title: 'Manage Orders',
      description: 'Process & track orders',
      icon: <ShoppingBag />,
      iconColor: '#FF9800',
      badge: '12',
      route: '/shop/orders',
    },
    {
      title: 'Customer Support',
      description: 'Chat with customers',
      icon: <Bell />,
      iconColor: '#9C27B0',
      badge: '5',
      route: '/shop/support',
    },
  ];

  const managementItems = [
    {
      title: 'Storefront Settings',
      description: 'Customize shop appearance',
      icon: <Settings />,
      route: '/shop/storefront',
      isActive: true,
    },
    {
      title: 'Inventory Management',
      description: 'Manage stock levels',
      icon: <Package />,
      route: '/shop/inventory',
      notificationCount: 3,
    },
    {
      title: 'Staff Management',
      description: 'Manage team members',
      icon: <Users />,
      route: '/shop/staff',
    },
    {
      title: 'Shipping Settings',
      description: 'Configure delivery options',
      icon: <Truck />,
      route: '/shop/shipping',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xl, paddingHorizontal: 16, paddingTop: 16 }}
      >
        {/* Welcome & Period Selector */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back!</Text>
            <Text style={[styles.subWelcomeText, { color: colors.textSecondary }]}>
              Here&apos;s your store overview for this week
            </Text>
          </View>

          <View style={styles.periodSelector}>
            {(['today', 'week', 'month'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ 
                  color: selectedPeriod === period ? colors.background : colors.textSecondary,
                  fontSize: 12,
                  fontFamily: selectedPeriod === period ? 'Inter_600SemiBold' : 'Inter_400Regular',
                }}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Revenue', value: '$12,458', change: '+12.5%', icon: <DollarSign size={20} color="#4CAF50" />, route: '/shop/analytics/revenue' },
            { label: 'Orders', value: '248', change: '+8.2%', icon: <ShoppingBag size={20} color="#2196F3" />, route: '/shop/analytics/orders' },
            { label: 'Products', value: '56', change: '+15%', icon: <Package size={20} color="#FF9800" />, route: '/shop/inventory' },
            { label: 'Customers', value: '1.2K', change: '+5.3%', icon: <Users size={20} color="#9C27B0" />, route: '/shop/customers' },
          ].map((stat, index) => (
            <View key={index} style={styles.statCardWrapper}>
              <StatCard
                label={stat.label}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                trend="up"
                onPress={() => router.push(stat.route)}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                iconColor={action.iconColor}
                badge={action.badge}
                onPress={() => router.push(action.route)}
              />
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/shop/orders')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View>
            {recentOrders.map((order) => (
              <RecentOrderCard
                key={order.id}
                {...order}
                status={order.status as any}
                onPress={() => router.push(`/shop/orders/${order.id}`)}
              />
            ))}
          </View>
        </View>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View style={[styles.alertSection, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color={colors.error} />
              <Text style={[styles.alertTitle, { color: colors.error }]}>Low Stock Alert</Text>
            </View>
            <View style={styles.lowStockList}>
              {lowStockProducts.map((product, index) => (
                <View key={index} style={styles.lowStockItem}>
                  <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                  <View style={styles.stockInfo}>
                    <Text style={[styles.stockText, { color: colors.error }]}>{product.stock} left</Text>
                    <Text style={[styles.thresholdText, { color: colors.textTertiary }]}>
                      (Threshold: {product.threshold})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => router.push('/shop/inventory')}
              style={[styles.restockButton, { backgroundColor: colors.error }]}
            >
              <Text style={[styles.restockText, { color: colors.background }]}>Restock Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Store Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Management</Text>
          </View>
          <View>
            {managementItems.map((item, index) => (
              <ManagementItem
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                onPress={() => router.push(item.route)}
                isActive={item.isActive}
                notificationCount={item.notificationCount}
              />
            ))}
          </View>
        </View>

        {/* Performance Overview */}
        <View style={[styles.performanceSection, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={styles.performanceHeader}>
            <TrendingUp size={24} color={colors.primary} />
            <View style={styles.performanceTextContainer}>
              <Text style={[styles.performanceTitle, { color: colors.primary }]}>
                Performance Overview
              </Text>
              <Text style={[styles.performanceSubtitle, { color: colors.textSecondary }]}>
                Your store is performing better than 85% of similar stores
              </Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>4.8★</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Customer Rating</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>92%</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Order Completion</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>2.1K</Text>
              <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Monthly Visits</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  subWelcomeText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  periodSelector: { flexDirection: 'row' },
  periodButton: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginLeft: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  statCardWrapper: { width: '48%', marginBottom: 12, marginRight: '4%' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  viewAllText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  alertSection: { padding: 16, marginBottom: 24, borderWidth: 1, borderRadius: 16 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  alertTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  lowStockList: { marginBottom: 16 },
  lowStockItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  productName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  stockInfo: { flexDirection: 'row', alignItems: 'center' },
  stockText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  thresholdText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  restockButton: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  restockText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  performanceSection: { padding: 16, borderWidth: 1, borderRadius: 16 },
  performanceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  performanceTextContainer: { flex: 1 },
  performanceTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginLeft: 12 },
  performanceSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginLeft: 12 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  metricLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});

export default ShopDashboard;
