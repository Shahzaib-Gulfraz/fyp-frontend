// app/(main)/home/components/ShopPostCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MoreVertical, Heart, MessageCircle, Zap, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from '../styles';

interface ShopPost {
  id: string;
  shopName: string;
  shopLogo: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  timestamp: string;
  category: string;
}

interface ShopPostCardProps {
  post: ShopPost;
  likedPosts: string[];
  savedPosts: string[];
  onLikePress: (postId: string) => void;
  onSavePress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
  onShopActionsPress: (postId: string) => void;
  onTryItPress: (postId: string) => void;
}

export const ShopPostCard: React.FC<ShopPostCardProps> = ({
  post,
  likedPosts,
  savedPosts,
  onLikePress,
  onSavePress,
  onCommentPress,
  onShopActionsPress,
  onTryItPress,
}) => {
  const { colors } = useTheme();

  return (
    <View key={post.id} style={[styles.postCard, {
      backgroundColor: colors.card,
      borderColor: colors.border
    }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.shopInfo}>
          <Image
            source={{ uri: post.shopLogo }}
            style={styles.shopLogo}
          />
          <View>
            <Text style={[styles.shopName, { color: colors.text }]}>{post.shopName}</Text>
            <Text style={[styles.postTime, { color: colors.textTertiary }]}>{post.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onShopActionsPress(post.id)}>
          <MoreVertical size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: post.image }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLikePress(post.id)}
          >
            <Heart
              size={24}
              color={likedPosts.includes(post.id) ? "#FF6B8B" : colors.textSecondary}
              fill={likedPosts.includes(post.id) ? "#FF6B8B" : "none"}
            />
            <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.likes}</Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onCommentPress(post.id)}
          >
            <MessageCircle size={24} color={colors.primary} />
            <Text style={[styles.actionCount, { color: colors.primary }]}>{post.comments}</Text>
          </TouchableOpacity>

          {/* Try It Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onTryItPress(post.id)}
          >
            <Zap size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Try It</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSavePress(post.id)}
        >
          <Bookmark
            size={20}
            color={savedPosts.includes(post.id) ? colors.accent : colors.textSecondary}
            fill={savedPosts.includes(post.id) ? colors.accent : "none"}
          />
        </TouchableOpacity>
      </View>

      {/* Post Description */}
      <View style={styles.postDescription}>
        <Text style={[styles.shopName, { color: colors.text }]}>{post.shopName}</Text>
        <Text style={[styles.postText, { color: colors.text }]}>{post.description}</Text>
        <Text style={[styles.postCategory, { color: colors.accent }]}>#{post.category}</Text>
      </View>
    </View>
  );
};