import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ImageIcon, Plus, ThumbsUp, MessageCircle, Bookmark, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get("window");

interface ProfileContentAreaProps {
    theme: any;
    activeTab: string;
    userPosts: any[];
    hasPosts: boolean;
    savedItems?: any[];
    savedLoading?: boolean;
}

export const ProfileContentArea = ({ theme, activeTab, userPosts, hasPosts, savedItems = [], savedLoading = false }: ProfileContentAreaProps) => {
    const styles = getStyles(theme.colors);
    const router = useRouter();

    const renderEmptyPosts = () => (
        <View style={styles.emptyPostsContainer}>
            <View style={styles.emptyIconContainer}>
                <ImageIcon size={64} color="#CCCCCC" />
            </View>
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
                Share your first virtual try-on experience
            </Text>
        </View>
    );

    const renderPostGrid = () => (
        <FlatList
            data={userPosts}
            numColumns={3}
            keyExtractor={(item) => item._id || item.id?.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.postItem}
                    onPress={() => router.push(`/(main)/social/post/${item._id}`)}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={styles.postImage}
                        contentFit="cover"
                    />
                    <View style={styles.postOverlay}>
                        <View style={styles.postStats}>
                            <View style={styles.postStat}>
                                <ThumbsUp size={12} color="#FFFFFF" />
                                <Text style={styles.postStatText}>
                                    {item.likesCount || item.likes?.length || 0}
                                </Text>
                            </View>
                            <View style={styles.postStat}>
                                <MessageCircle size={12} color="#FFFFFF" />
                                <Text style={styles.postStatText}>
                                    {item.commentsCount || item.comments?.length || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            contentContainerStyle={styles.postsGrid}
            scrollEnabled={false}
        />
    );

    const renderSavedGrid = () => (
        <FlatList
            data={savedItems}
            numColumns={3}
            keyExtractor={(item) => item._id || item.productId?._id}
            renderItem={({ item }) => {
                // Handle image URL - could be string or object
                const imageUrl = item.productId?.images?.[0]
                    ? (typeof item.productId.images[0] === 'string'
                        ? item.productId.images[0]
                        : item.productId.images[0]?.url)
                    : (typeof item.productId?.thumbnail === 'string'
                        ? item.productId.thumbnail
                        : item.productId?.thumbnail?.url);

                return (
                    <TouchableOpacity
                        style={styles.postItem}
                        onPress={() => router.push(`/buy/${item.productId?._id}`)}
                    >
                        <Image
                            source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                            style={styles.postImage}
                            contentFit="cover"
                        />
                        <View style={styles.savedIcon}>
                            <Bookmark size={16} color="#00BCD4" fill="#00BCD4" />
                        </View>
                    </TouchableOpacity>
                );
            }}
            contentContainerStyle={styles.postsGrid}
            scrollEnabled={false}
        />
    );

    switch (activeTab) {
        case "posts":
            return (
                <View style={styles.contentArea}>
                    {hasPosts ? (
                        <View style={styles.postsSection}>
                            <Text style={styles.sectionTitle}>Your Posts</Text>
                            {renderPostGrid()}
                        </View>
                    ) : (
                        renderEmptyPosts()
                    )}
                </View>
            );

        case "saved":
            return (
                <View style={styles.contentArea}>
                    <Text style={styles.sectionTitle}>Saved Items</Text>
                    {savedLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
                        </View>
                    ) : savedItems.length > 0 ? (
                        renderSavedGrid()
                    ) : (
                        <View style={styles.emptyPostsContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Bookmark size={64} color="#CCCCCC" />
                            </View>
                            <Text style={styles.emptyTitle}>No Saved Items</Text>
                            <Text style={styles.emptySubtitle}>
                                Your saved products will appear here
                            </Text>
                        </View>
                    )}
                </View>
            );
        case "activity":
            return (
                <View style={styles.contentArea}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {userPosts.length > 0 ? (
                        <View style={styles.activityList}>
                            {userPosts.slice(0, 10).map((post: any, index: number) => (
                                <View key={post._id || index} style={styles.activityItem}>
                                    <View style={styles.activityDot} />
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityText}>
                                            Posted "{post.caption?.substring(0, 30) || 'a new photo'}{post.caption?.length > 30 ? '...' : ''}"
                                        </Text>
                                        <Text style={styles.activityTime}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyPostsContainer}>
                            <View style={styles.emptyIconContainer}>
                                <TrendingUp size={64} color="#CCCCCC" />
                            </View>
                            <Text style={styles.emptyTitle}>No Activity Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Your recent activities will appear here
                            </Text>
                        </View>
                    )}
                </View>
            );
        default:
            return null;
    }
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        contentArea: {
            minHeight: 300,
            paddingHorizontal: 20,
        },
        postsSection: {
            flex: 1,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 20,
        },
        postsGrid: {
            paddingBottom: 20,
        },
        postItem: {
            width: (width - 60) / 3,
            height: (width - 60) / 3,
            margin: 1,
            position: "relative",
        },
        postImage: {
            width: "100%",
            height: "100%",
        },
        postOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            justifyContent: "flex-end",
            padding: 8,
        },
        postStats: {
            flexDirection: "row",
            gap: 12,
        },
        postStat: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        postStatText: {
            fontSize: 11,
            color: "#FFFFFF",
            fontWeight: "600",
        },
        emptyPostsContainer: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 60,
        },
        emptyIconContainer: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.surface,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            color: "#666666",
            textAlign: "center",
            marginBottom: 25,
            paddingHorizontal: 40,
            lineHeight: 20,
        },
        createPostButton: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#00BCD4",
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            gap: 8,
        },
        createPostText: {
            fontSize: 15,
            fontWeight: "600",
            color: "#FFFFFF",
        },
        wardrobeGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
        },
        wardrobeItem: {
            width: (width - 44) / 3,
            height: (width - 44) / 3,
        },
        wardrobeImage: {
            width: "100%",
            height: "100%",
        },
        savedGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
        },
        savedItem: {
            width: (width - 44) / 3,
            height: (width - 44) / 3,
            position: "relative",
        },
        savedImage: {
            width: "100%",
            height: "100%",
        },
        savedIcon: {
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 10,
            padding: 4,
        },
        activityList: {
            gap: 16,
        },
        activityItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        activityDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#00BCD4",
            marginRight: 16,
        },
        activityContent: {
            flex: 1,
        },
        activityText: {
            fontSize: 15,
            color: colors.text,
            marginBottom: 2,
        },
        activityTime: {
            fontSize: 13,
            color: "#999999",
        },
    });
