import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router'; // Added useRouter
import { Heart, MessageCircle, MoreVertical, Share2, Tag } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useUser } from '@/src/context/UserContext';
import { Post } from '@/src/types/social';
import postService from '@/src/api/postService';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    post: Post;
    onLikeToggle?: (postId: string, isLiked: boolean) => void;
    onCommentPress?: (postId: string) => void;
    onUserPress?: (userId: string) => void;
    onSharePress?: (postId: string) => void;
}

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLikeToggle, onCommentPress, onUserPress, onSharePress }: PostCardProps) {
    const router = useRouter(); // Initialize router
    const { theme, tokens } = useTheme();
    const { colors } = theme;
    const { spacing, radius, fonts } = tokens;
    const { user } = useUser();

    // Correctly determine if liked by checking the likes array
    // Correctly determine if liked by checking the likes array
    const initialIsLiked = post.likes?.some((like: any) =>
        (typeof like === 'string' ? like : like._id) === user?.id
    ) || false;

    // Local state for optimistic updates
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    // Use likes.length if likesCount is missing
    const [likesCount, setLikesCount] = useState(post.likesCount ?? (post.likes?.length || 0));
    // Gesture state
    const lastTap = React.useRef<number | null>(null);
    const tapTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const handleLike = async () => {
        const newIsLiked = !isLiked;
        const newCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        // Optimistic update
        setIsLiked(newIsLiked);
        setLikesCount(newCount);

        try {
            await postService.likePost(post._id);
            onLikeToggle?.(post._id, newIsLiked);
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(likesCount);
            console.error('Like error:', error);
        }
    };

    const handleImageTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;

        if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
            // Double Tap detected
            if (tapTimeout.current) clearTimeout(tapTimeout.current);
            if (!isLiked) handleLike();
            lastTap.current = null;
        } else {
            // Single Tap detected - Wait to see if it becomes a double tap
            lastTap.current = now;
            tapTimeout.current = setTimeout(() => {
                onCommentPress?.(post._id); // Navigate to detail
                lastTap.current = null;
            }, DOUBLE_PRESS_DELAY);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={[styles.header, { padding: spacing.md }]}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => onUserPress?.(post.userId._id)}
                >
                    <Image
                        source={{
                            uri: post.userId.profileImage || `https://ui-avatars.com/api/?name=${post.userId.fullName}&background=random`
                        }}
                        style={[styles.avatar, { borderRadius: radius.full }]}
                    />
                    <View style={{ marginLeft: spacing.sm }}>
                        <Text style={[styles.username, { color: colors.text }]}>
                            {post.userId.username}
                        </Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <MoreVertical size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Image */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleImageTap}
            >
                <Image
                    source={{ uri: post.image }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {/* Linked Product Preview */}
            {post.productId && typeof post.productId === 'object' && (
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.card, // or surface logic
                        marginTop: 10,
                        marginHorizontal: 12,
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                    onPress={() => router.push(`/(main)/buy/${(post.productId as any)._id}`)}
                >
                    <Image
                        source={{ uri: (post.productId as any).thumbnail?.url || (post.productId as any).thumbnail || (post.productId as any).images?.[0]?.url || 'https://placehold.co/50' }}
                        style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: '#f0f0f0' }}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                            {(post.productId as any).name || 'Product'}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
                            ${(post.productId as any).price || '0.00'}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Shop</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Actions */}
            <View style={[styles.actions, { padding: spacing.md }]}>
                <View style={styles.leftActions}>
                    <TouchableOpacity onPress={handleLike} style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg }}>
                        <Heart
                            size={24}
                            color={isLiked ? colors.error : colors.text}
                            fill={isLiked ? colors.error : 'transparent'}
                        />
                        {likesCount > 0 && (
                            <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '500', color: colors.text }}>
                                {likesCount}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onCommentPress?.(post._id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg }}>
                        <MessageCircle size={24} color={colors.text} />
                        {(post.commentsCount ?? (post.comments?.length || 0)) > 0 && (
                            <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '500', color: colors.text }}>
                                {post.commentsCount ?? (post.comments?.length || 0)}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onSharePress?.(post._id)}>
                        <Share2 size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

            </View>

            <View style={[styles.footer, { paddingHorizontal: spacing.md, paddingBottom: spacing.md }]}>

                {post.caption && (
                    <TouchableOpacity onPress={() => onCommentPress?.(post._id)}>
                        <View style={styles.captionContainer}>
                            <Text style={[styles.caption, { color: colors.text }]}>
                                <Text style={{ fontWeight: 'bold' }}>{post.userId.username}</Text>
                                {` ${post.caption}`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {post.commentsCount && post.commentsCount > 0 ? (
                    <TouchableOpacity onPress={() => onCommentPress?.(post._id)}>
                        <Text style={[styles.viewComments, { color: colors.textSecondary }]}>
                            View all {post.commentsCount} comments
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
    },
    username: {
        fontWeight: '600',
        fontSize: 14,
    },
    time: {
        fontSize: 12,
    },
    postImage: {
        width: width,
        height: width, // Square posts for now
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    productTagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        gap: 4,
    },
    likes: {
        fontWeight: '600',
        marginBottom: 4,
    },
    captionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    caption: {
        fontSize: 14,
        lineHeight: 20,
    },
    viewComments: {
        fontSize: 14,
        marginTop: 4,
    }
});
