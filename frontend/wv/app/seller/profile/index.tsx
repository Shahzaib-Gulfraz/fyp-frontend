import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import ShopProfileHeader from './ShopProfileHeader';
import BannerSection from './BannerSection';
import StatsSection from './StatsSection';
import PostsSection from './PostsSection';
import ShopInfo from './ShopInfo';
import EditProfileModal from './EditProfileModal';
import ShareProfileModal from './ShareProfileModal';
import { appTheme } from '@/src/theme/appTheme';
import { useTheme } from '@/src/context/ThemeContext';
import { shopService } from '@/src/api';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useSocket } from '@/src/context/SocketContext';

const ShopProfileScreen = () => {
  const { isDark, colors, tokens } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const { unreadNotifications: notificationCount } = useSocket(); // Use live socket count
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shopService.getMyShop();

      const shop = response.shop;

      // Fetch shop products as "posts"
      let productsRes;
      try {
        productsRes = await shopService.getShopProducts(shop._id);
      } catch (err) {
        console.warn('Could not fetch shop products:', err);
        productsRes = { products: [] };
      }

      // Map products to "Posts"
      const mappedPosts = productsRes.products.map((p: any) => ({
        id: p._id,
        image: p.images?.[0]?.url || 'https://placehold.co/300',
        title: p.name,
        likes: p.likes || 0,
        comments: p.reviews?.length || 0,
        shares: 0,
        date: p.createdAt,
        type: p.type || 'product'
      }));

      // Map backend data to frontend expectations
      const mappedShop = {
        ...shop,
        name: shop.shopName,
        ownerName: shop.shopUsername || 'Shop Owner',
        description: shop.description || 'Welcome to our shop!',
        avatar: shop.logo?.url,
        banner: shop.banner?.url,
        contact: {
          email: shop.email,
          phone: shop.phone,
          address: shop.address,
          website: shop.website,
        },
        // Use backend stats or provide defaults
        stats: {
          totalSales: shop.stats?.totalSales || 0,
          monthlyRevenue: shop.stats?.monthlyRevenue || 0,
          conversionRate: shop.stats?.conversionRate || 0,
          avgOrderValue: shop.stats?.avgOrderValue || 0,
          visitorCount: shop.stats?.visitorCount || 0,
          returningCustomers: shop.stats?.returningCustomers || 0,
          products: {
            total: shop.stats?.totalProducts || productsRes.products.length,
            published: productsRes.products.length,
            draft: 0
          },
          followers: shop.stats?.followers || 0,
          following: shop.stats?.following || 0,
          rating: shop.stats?.rating || 0,
        },
        settings: shop.settings || {
          notifications: true,
          showOnline: true,
          privateAccount: false
        },
        social: shop.social || {
          instagram: '',
          facebook: '',
          twitter: ''
        },
        hours: shop.hours || {
          'Monday': '9:00 AM - 6:00 PM',
          'Tuesday': '9:00 AM - 6:00 PM',
          'Wednesday': '9:00 AM - 6:00 PM',
          'Thursday': '9:00 AM - 6:00 PM',
          'Friday': '9:00 AM - 6:00 PM',
          'Saturday': '10:00 AM - 4:00 PM',
          'Sunday': 'Closed'
        },
        posts: mappedPosts
      };

      setShopData(mappedShop);
    } catch (err: any) {
      console.error('Error fetching shop profile:', err);
      setError(err.message || 'Failed to load shop profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const paperTheme = {
    ...appTheme,
    dark: isDark,
    colors,
  };

  // Handlers
  const handleEditProfile = () => setEditModalVisible(true);
  const handleShareProfile = () => setShareModalVisible(true);
  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      if (shopData?._id) {
        // Map back to backend structure
        const backendData = {
          shopName: updatedProfile.name,
          description: updatedProfile.description,
          email: updatedProfile.contact.email,
          phone: updatedProfile.contact.phone,
          address: updatedProfile.contact.address,
          website: updatedProfile.contact.website,
          social: updatedProfile.social,
          settings: updatedProfile.settings,
          hours: updatedProfile.hours
        };

        const images = {
          logo: updatedProfile.avatar,
          banner: updatedProfile.banner
        };

        await shopService.updateShop(shopData._id, backendData, images);
        await fetchShopProfile();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCreatePost = () => Alert.alert('Create Post', 'This would open the post creation screen.');
  const handleViewAnalytics = () => Alert.alert('View Analytics', 'This would open the analytics screen.');
  const handlePostPress = (post: any) => Alert.alert('Post Details', `Viewing post: ${post.title}`);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your shop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Loading Profile...</Text>
      </View>
    );
  }

  if (error || !shopData) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error, marginBottom: 20 }}>{error || 'Shop not found'}</Text>
        <Button mode="contained" onPress={fetchShopProfile}>Retry</Button>
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ShopProfileHeader
          title="Shop Profile"
          onBack={() => console.log('Go back')}
          onShare={handleShareProfile}
          onNotification={() => setNotificationCount(0)}
          notificationCount={notificationCount}
          onLogout={handleLogout}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BannerSection
            shop={{ ...shopData, isVerified: shopData.isVerified, isFollowing: false, since: new Date(shopData.createdAt).getFullYear().toString() }}
            onEdit={handleEditProfile}
            onFollow={() => Alert.alert('Follow', 'Follow action triggered')}
            onMessage={() => Alert.alert('Message', 'Message shop owner')}
          />

          <StatsSection stats={shopData.stats} onViewAnalytics={handleViewAnalytics} />

          <PostsSection
            posts={shopData.posts || []}
            onCreatePost={handleCreatePost}
            onPostPress={handlePostPress}
          />

          <ShopInfo shop={shopData} />

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <EditProfileModal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          onSave={handleSaveProfile}
          initialProfile={shopData}
        />

        <ShareProfileModal
          visible={shareModalVisible}
          onDismiss={() => setShareModalVisible(false)}
          shopName={shopData.name}
          profileUrl={`https://app.wearvirtually.com/shop/${shopData.shopUsername}`}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  bottomSpacer: { height: 80 },
});

export default ShopProfileScreen;
