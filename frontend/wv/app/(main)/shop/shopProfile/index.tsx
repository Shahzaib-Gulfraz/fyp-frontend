import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ShopProfileHeader from './ShopProfileHeader';
import BannerSection from './BannerSection';
import StatsSection from './StatsSection';
import PostsSection from './PostsSection';
import ShopInfo from './ShopInfo';
import EditProfileModal from './EditProfileModal';
import ShareProfileModal from './ShareProfileModal';
import { appTheme } from '@/src/theme/appTheme';
import { useTheme } from '@/src/context/ThemeContext';

// Mock data
const mockShop = {
  name: 'Fashion Hub',
  ownerName: 'John Doe',
  description: 'Welcome to Fashion Hub! We offer the latest fashion trends...',
  contact: { email: 'contact@fashionhub.com', phone: '+1 (555) 123-4567', address: '123 Fashion Street, NY', website: 'www.fashionhub.com' },
  hours: { Monday: '9:00 AM - 8:00 PM', Tuesday: '9:00 AM - 8:00 PM' }, // shortened
  social: { instagram: '@fashionhub', facebook: 'facebook.com/fashionhub', twitter: '@fashionhub_official' },
  stats: {
    totalSales: 125430,
    monthlyRevenue: 18450,
    conversionRate: 3.2,
    avgOrderValue: 89.99,
    visitorCount: 12543,
    returningCustomers: 42,
    products: { total: 156, published: 128, draft: 28 },
    followers: 1245,
    following: 342,
    rating: 4.8,
  },
};

const mockPosts = [
  { id: '1', image: 'https://picsum.photos/300/300?random=1', title: 'New Arrival', likes: 234, comments: 45, shares: 12, date: '2024-01-15', type: 'image' as const },
  { id: '2', image: 'https://picsum.photos/300/300?random=2', title: 'Summer Collection', likes: 189, comments: 32, shares: 8, date: '2024-01-14', type: 'image' as const },
];

const ShopProfileScreen = () => {
  const { isDark, colors, tokens } = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Use the appTheme directly with PaperProvider
  const paperTheme = {
    ...appTheme,
    dark: isDark,
    colors,
  };

  // Handlers
  const handleEditProfile = () => setEditModalVisible(true);
  const handleShareProfile = () => setShareModalVisible(true);
  const handleSaveProfile = (updatedProfile: any) => console.log('Profile saved:', updatedProfile);
  const handleCreatePost = () => Alert.alert('Create Post', 'This would open the post creation screen.');
  const handleViewAnalytics = () => Alert.alert('View Analytics', 'This would open the analytics screen.');
  const handlePostPress = (post: any) => Alert.alert('Post Details', `Viewing post: ${post.title}`);
  const handleNotificationPress = () => {
    setNotificationCount(0);
    Alert.alert('Notifications', 'This would open notifications screen.');
  };

  return (
    <PaperProvider theme={paperTheme}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ShopProfileHeader
          title="Shop Profile"
          onBack={() => console.log('Go back')}
          onShare={handleShareProfile}
          onNotification={handleNotificationPress}
          notificationCount={notificationCount}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BannerSection
            shop={{ ...mockShop, isVerified: true, isFollowing: false, since: '2022' }}
            onEdit={handleEditProfile}
            onFollow={() => Alert.alert('Follow', 'Follow action triggered')}
            onMessage={() => Alert.alert('Message', 'Message shop owner')}
          />

          <StatsSection stats={mockShop.stats} onViewAnalytics={handleViewAnalytics} />

          <PostsSection
            posts={mockPosts}
            onCreatePost={handleCreatePost}
            onPostPress={handlePostPress}
          />

          <ShopInfo shop={mockShop} />

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <EditProfileModal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          onSave={handleSaveProfile}
          initialProfile={mockShop}
        />

        <ShareProfileModal
          visible={shareModalVisible}
          onDismiss={() => setShareModalVisible(false)}
          shopName={mockShop.name}
          profileUrl="https://app.example.com/shop/fashion-hub"
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  bottomSpacer: { height: 80 },
});

export default ShopProfileScreen;
