// app/(main)/home/components/ShopActionsModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { X, Bookmark, Zap, Share2, Flag, User, Clock, ShoppingBag, Bell } from 'lucide-react-native';
import { styles } from '../styles';
import { useTheme } from '@/src/context/ThemeContext';

interface ShopActionsModalProps {
  visible: boolean;
  onClose: () => void;
  shop: {
    shopLogo: string;
    shopName: string;
    shopDescription: string;
  } | null;
  followedShops: string[];
  onFollowShop: (shopName: string) => void;
  onSavePost: () => void;
  onTryItPress: () => void;
  slideAnim: Animated.Value;
}

export const ShopActionsModal: React.FC<ShopActionsModalProps> = ({
  visible,
  onClose,
  shop,
  followedShops,
  onFollowShop,
  onSavePost,
  onTryItPress,
  slideAnim,
}) => {
  const { colors } = useTheme(); // ✅ useTheme instead of appTheme()

  const shopActions = [
    { id: 1, icon: Bookmark, label: "Save", color: colors.accent, action: onSavePost },
    { id: 2, icon: Zap, label: "Try It", color: "#4CAF50", action: onTryItPress },
    { id: 3, icon: Share2, label: "Share", color: "#2196F3", action: () => { } },
    { id: 4, icon: Flag, label: "Report", color: "#FF9800", action: () => { } },
  ];

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Shop Actions Panel */}
        <Animated.View
          style={[
            styles.shopActionsPanel,
            { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Shop Info Header */}
          <View style={[styles.shopActionsHeader, { borderBottomColor: colors.border }]}>
            <Image source={{ uri: shop?.shopLogo }} style={styles.shopModalLogo} />
            <View style={styles.shopInfoModal}>
              <Text style={[styles.shopModalName, { color: colors.text }]}>{shop?.shopName}</Text>
              <Text style={[styles.shopModalFollowers, { color: colors.textSecondary }]}>
                15.2K followers
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Shop Actions Grid */}
          <View style={styles.shopActionsGrid}>
            {shopActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.shopActionItem}
                  onPress={() => {
                    action.action();
                    if (action.label === "Save") onClose();
                  }}
                >
                  <View style={[styles.shopActionCircle, { backgroundColor: action.color }]}>
                    <Icon size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.shopActionLabel, { color: colors.text }]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            style={[
              styles.followButton,
              {
                backgroundColor: followedShops.includes(shop?.shopName || '')
                  ? colors.border
                  : colors.primary,
              },
            ]}
            onPress={() => shop?.shopName && onFollowShop(shop.shopName)}
          >
            <Text
              style={[
                styles.followButtonText,
                {
                  color: followedShops.includes(shop?.shopName || '') ? colors.text : "#FFFFFF",
                },
              ]}
            >
              {followedShops.includes(shop?.shopName || '') ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          {/* About This Account Section */}
          <View style={styles.aboutSection}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>About this account</Text>
            <Text style={[styles.aboutText, { color: colors.text }]}>{shop?.shopDescription}</Text>

            <View style={styles.shopStats}>
              <View style={styles.statItem}>
                <ShoppingBag size={16} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>• 245 products</Text>
              </View>
              <View style={styles.statItem}>
                <User size={16} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>• 15.2K followers</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>• Joined 2022</Text>
              </View>
            </View>

            {followedShops.includes(shop?.shopName || '') && (
              <View
                style={[
                  styles.notificationSection,
                  { backgroundColor: 'rgba(0, 188, 212, 0.1)' },
                ]}
              >
                <View style={styles.notificationHeader}>
                  <Bell size={20} color={colors.text} />
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>Notifications</Text>
                </View>
                <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
                  Get notified when {shop?.shopName} posts new products
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
