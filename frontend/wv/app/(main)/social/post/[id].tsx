import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Post, Comment } from '@/src/types/social';
import postService from '@/src/api/postService';
import PostCard from '../../../../components/social/PostCard';
import { Send } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailScreen() {
    const { theme, tokens } = useTheme();
    const { colors } = theme;
    const { spacing, radius } = tokens;
    const { id } = useLocalSearchParams();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadPost = async () => {
        try {
            const data = await postService.getPost(id as string);
            setPost(data.data.post);
        } catch (error) {
            console.error('Load post error:', error);
            Alert.alert('Error', 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadPost();
    }, [id]);

    const handlePostComment = async () => {
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            const response = await postService.commentPost(post!._id, commentText);
            setCommentText('');
            // Add new comment to local state or reload
            setPost(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    comments: [...prev.comments, response.data.comment],
                    commentsCount: (prev.commentsCount || 0) + 1
                };
            });
        } catch (error) {
            console.error('Comment error:', error);
            Alert.alert('Error', 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <Stack.Screen options={{ title: 'Post' }} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Stack.Screen options={{ title: 'Post' }} />
                <Text style={{ color: colors.text }}>Post not found</Text>
            </View>
        );
    }

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={[styles.commentContainer, { borderBottomColor: colors.border }]}>
            <Image
                source={{ uri: item.userId?.profileImage || `https://ui-avatars.com/api/?name=${item.userId?.fullName}&background=random` }}
                style={[styles.avatar, { borderRadius: radius.full }]}
            />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: 13 }}>
                        {item.userId?.username}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 6 }}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14 }}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <Stack.Screen options={{ title: 'Post' }} />

            <FlatList
                data={post.comments}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={renderComment}
                ListHeaderComponent={
                    <View style={{ marginBottom: spacing.md }}>
                        <PostCard post={post} />

                        {/* Likes Section */}
                        {post.likes && post.likes.length > 0 && (
                            <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: 14, marginBottom: 8 }}>
                                    Liked by {post.likes.length} people
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {post.likes.map((like: any, index: number) => {
                                        const user = typeof like === 'string' ? null : like;
                                        if (!user) return null;
                                        return (
                                            <View key={user._id || index} style={{ marginRight: 12, alignItems: 'center', width: 60 }}>
                                                <Image
                                                    source={{ uri: user.profileImage || `https://ui-avatars.com/api/?name=${user.fullName}&background=random` }}
                                                    style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 4 }}
                                                />
                                                <Text numberOfLines={1} style={{ fontSize: 10, color: colors.text, textAlign: 'center' }}>
                                                    {user.username}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm }}>
                            <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: 16 }}>
                                Comments ({post.comments?.length || 0})
                            </Text>
                        </View>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderRadius: radius.full
                    }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textSecondary}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity
                    onPress={handlePostComment}
                    disabled={submitting || !commentText.trim()}
                    style={{ opacity: !commentText.trim() ? 0.5 : 1, padding: 8 }}
                >
                    <Send size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    commentContainer: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 36,
        height: 36,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
    }
});
