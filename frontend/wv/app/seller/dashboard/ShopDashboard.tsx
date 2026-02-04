// src/screens/shop/ShopDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  LogBox,
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
  Bell,
  MessageCircle,
  AlertCircle,
  LogOut,
  User,
} from 'lucide-react-native';

import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { useSocket } from '@/src/context/SocketContext';
import shopService from '@/src/api/shopService';
import RecentOrderCard from './RecentOrderCard';

LogBox.ignoreLogs([
  'Invalid DOM property `transform-origin`',
  'TouchableMixin is deprecated',
]);
// ManagementItem removed - not used

const { width } = Dimensions.get('window');

const ShopDashboard: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { logout, isAuthenticated, userType, checkAuth } = useAuth();
  // Live socket data
  const {
    socket,
    unreadNotifications, setUnreadNotifications,
    unreadMessages, setUnreadMessages
  } = useSocket();

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    pendingOrders: 0,
    unreadMessages: 0,
    unreadNotifications: 0 // NEW
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      if (!isAuthenticated || userType !== 'shop') {
        console.log('Dashboard: Not authenticated or wrong user type, checking auth...');
        await checkAuth();
      }

      console.log('Dashboard: Fetching stats...');
      const data = await shopService.getShopStats();
      if (data) {
        setStats(data.stats || {
          revenue: 0,
          orders: 0,
          products: 0,
          customers: 0,
          pendingOrders: 0,
          unreadMessages: 0,
          unreadNotifications: 0
        });

        // SYNC SOCKET CONTEXT WITH API DATA
        setUnreadMessages(data.stats?.unreadMessages || 0);
        setUnreadNotifications(data.stats?.unreadNotifications || 0);

        setRecentOrders(data.recentOrders || []);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      if (error?.response?.status === 401) {
        console.log('Dashboard: 401 received. Token might be invalid.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, userType, checkAuth, setUnreadMessages, setUnreadNotifications]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listen for real-time message updates
  useEffect(() => {
    if (socket) {
      const handleNewMessage = () => {
        console.log('[Dashboard] New message received, incrementing count');
        setUnreadMessages(prev => prev + 1);
      };

      const handleNewNotification = () => {
        console.log('[Dashboard] New notification received, incrementing count');
        setUnreadNotifications(prev => prev + 1);
      };

      const handleNewOrder = (data: any) => {
        console.log('[Dashboard] New order received:', data);
        // Increment pending orders and refresh data
        setStats(prev => ({
          ...prev,
          pendingOrders: prev.pendingOrders + 1,
          orders: prev.orders + 1
        }));
        // Also trigger notification increment
        setUnreadNotifications(prev => prev + 1);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message:new', handleNewMessage);
      socket.on('notification:new', handleNewNotification);
      socket.on('new_order', handleNewOrder);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message:new', handleNewMessage);
        socket.off('notification:new', handleNewNotification);
        socket.off('new_order', handleNewOrder);
      };
    }
  }, [socket, setUnreadMessages, setUnreadNotifications]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    const doLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to logout?")) {
        doLogout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: doLogout
          }
        ]
      );
    }
  };

  const quickActions = [
    {
      title: 'Add Product',
      icon: <Plus />,
      color: '#4CAF50',
      route: '/seller/products/add',
    },
    {
      title: 'Messages',
      icon: <MessageCircle />,
      color: '#2196F3',
      route: '/seller/messages',
      hasUnread: unreadMessages > 0,
      showDot: true
    },
    {
      title: 'Orders',
      icon: <ShoppingBag />,
      color: '#FF9800',
      route: '/seller/orders',
      hasUnread: stats.pendingOrders > 0,
      showDot: true
    },
    {
      title: 'Returns',
      icon: <AlertCircle />,
      color: '#F44336',
      route: '/seller/returns',
    },
    {
      title: 'Profile',
      icon: <User />,
      color: '#9C27B0',
      route: '/seller/profile',
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Modern Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Dashboard</Text>
          <Text style={[styles.shopName, { color: colors.text }]}>My Shop</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Notification Bell */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/seller/notifications')}
          >
            <Bell size={20} color={colors.text} />
            {unreadNotifications > 0 && ( // USE CONTEXT VALUE
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, paddingBottom: 20 }}
      >
        {/* Key Metrics Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsGrid}>
            {[
              { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, change: '+12%', icon: <DollarSign size={18} color="#fff" />, color: '#4CAF50', route: '/seller/analytics/revenue' },
              { label: 'Orders', value: stats.orders.toString(), change: '+8%', icon: <ShoppingBag size={18} color="#fff" />, color: '#2196F3', route: '/seller/analytics/orders' },
              { label: 'Products', value: stats.products.toString(), change: '+2', icon: <Package size={18} color="#fff" />, color: '#FF9800', route: '/seller/products' },
              { label: 'Customers', value: stats.customers.toString(), change: '+5%', icon: <Users size={18} color="#fff" />, color: '#9C27B0', route: '/seller/analytics' },
            ].map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  {stat.icon}
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <View style={styles.statChange}>
                    <TrendingUp size={12} color={colors.success} />
                    <Text style={[styles.statChangeText, { color: colors.success }]}>{stat.change}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions (Horizontal) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  {React.cloneElement(action.icon as React.ReactElement<any>, { size: 24, color: action.color })}
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                {action.showDot && action.hasUnread && (
                  <View style={styles.redDot} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View style={[styles.alertCard, { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' }]}>
            <View style={styles.alertContent}>
              <AlertCircle size={24} color="#E53E3E" />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.alertTitle, { color: '#C53030' }]}>Low Stock Warning</Text>
                <Text style={[styles.alertText, { color: '#C53030' }]}>
                  {lowStockProducts.length} items are running low.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: '#E53E3E' }]}
              onPress={() => router.push('/seller/products')}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/seller/orders')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View>
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <RecentOrderCard
                  key={order._id}
                  id={order.orderNumber || order._id}
                  customerName={order.userId?.fullName || 'Unknown'}
                  productName={order.items?.[0]?.name || 'Product'}
                  productImage={order.items?.[0]?.thumbnail}
                  price={`$${order.total}`}
                  status={order.status}
                  date={new Date(order.createdAt).toLocaleDateString()}
                  onPress={() => router.push(`/seller/orders/${order._id}`)}
                />
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>No recent orders</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  shopName: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  headerBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  periodContainer: { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  periodSelector: { flexDirection: 'row', padding: 4, borderRadius: 25, borderWidth: 1, alignSelf: 'flex-start' },
  periodTab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  periodText: { fontSize: 12, fontWeight: '600' },
  sectionContainer: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewAll: { fontSize: 14, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 52) / 2, // 2 columns with padding/gap
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statInfo: {},
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statChange: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statChangeText: { fontSize: 11, fontWeight: '600' },
  actionsScroll: { paddingRight: 20, gap: 12 },
  actionCard: {
    width: 100,
    height: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  redDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chartCard: { marginHorizontal: 20, marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, width: '100%' },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSubtitle: { fontSize: 12, marginTop: 2 },
  chartPlaceholder: { height: 120, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertCard: { marginHorizontal: 20, marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700' },
  alertText: { fontSize: 12, marginTop: 2 },
  alertButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
});

export default ShopDashboard;
