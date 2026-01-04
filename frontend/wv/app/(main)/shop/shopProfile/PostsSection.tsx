import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Card, Text, IconButton, Button, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors, AppTokensType } from '@/src/context/ThemeContext';

const { width } = Dimensions.get('window');
const POST_WIDTH = (width - 48) / 3;

interface Post {
  id: string;
  image: string;
  title: string;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  type: 'image' | 'video' | 'product';
}

interface PostsSectionProps {
  posts: Post[];
  onCreatePost?: () => void;
  onPostPress?: (post: Post) => void;
}

const PostsSection: React.FC<PostsSectionProps> = ({ posts, onCreatePost, onPostPress }) => {
  const { colors, tokens } = useTheme();
  const styles = makeStyles(colors, tokens);

  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video' | 'product'>('all');

  const filteredPosts = selectedFilter === 'all'
    ? posts
    : posts.filter(post => post.type === selectedFilter);

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.8}
    >
      <View style={styles.postImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name={item.type === 'video' ? 'play-circle' : 'image'}
              size={32}
              color={colors.textTertiary}
            />
          </View>
        )}

        {item.type === 'video' && (
          <View style={styles.videoBadge}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </View>
        )}

        {item.type === 'product' && (
          <View style={styles.productBadge}>
            <Ionicons name="pricetag" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={12} color="#FFFFFF" />
            <Text style={styles.statText}>{formatCount(item.likes)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
            <Text style={styles.statText}>{formatCount(item.comments)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="share" size={12} color="#FFFFFF" />
            <Text style={styles.statText}>{formatCount(item.shares)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>Shop Posts</Text>
            <View style={styles.headerActions}>
              <Menu
                visible={menuVisible === 'filter'}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible('filter')}
                    style={styles.filterButton}
                    icon="filter-variant"
                    contentStyle={{ flexDirection: 'row-reverse' }}
                  >
                    {selectedFilter === 'all' ? 'All' : selectedFilter}
                  </Button>
                }
              >
                {(['all','image','video','product'] as const).map((filter) => (
                  <React.Fragment key={filter}>
                    <Menu.Item
                      onPress={() => {
                        setSelectedFilter(filter);
                        setMenuVisible(null);
                      }}
                      title={filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      leadingIcon={selectedFilter === filter ? 'check' : undefined}
                    />
                    {filter !== 'product' && <Divider />}
                  </React.Fragment>
                ))}
              </Menu>

              {onCreatePost && (
                <IconButton
                  icon="plus"
                  iconColor={colors.primary}
                  size={24}
                  onPress={onCreatePost}
                />
              )}
            </View>
          </View>

          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No posts yet</Text>
              {onCreatePost && (
                <Button
                  mode="contained"
                  onPress={onCreatePost}
                  style={styles.createButton}
                  icon="plus"
                >
                  Create First Post
                </Button>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const makeStyles = (colors: ThemeColors, tokens: AppTokensType) => StyleSheet.create({
  container: {
    marginHorizontal: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
  },
  headerCard: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginRight: tokens.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postContainer: {
    width: POST_WIDTH,
    marginBottom: 4,
    position: 'relative',
  },
  postImageContainer: {
    width: POST_WIDTH,
    height: POST_WIDTH,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.divider,
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderBottomLeftRadius: tokens.radius.sm,
    borderBottomRightRadius: tokens.radius.sm,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 2,
    fontWeight: '600',
  },
});

export default PostsSection;
