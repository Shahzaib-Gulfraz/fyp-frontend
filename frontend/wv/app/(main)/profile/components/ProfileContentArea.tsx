import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ImageIcon, Plus, ThumbsUp, MessageCircle, Bookmark } from 'lucide-react-native';

const { width } = Dimensions.get("window");

interface ProfileContentAreaProps {
    theme: any;
    activeTab: string;
    userPosts: any[];
    hasPosts: boolean;
}

export const ProfileContentArea = ({ theme, activeTab, userPosts, hasPosts }: ProfileContentAreaProps) => {
    const styles = getStyles(theme.colors);

    const renderEmptyPosts = () => (
        <View style={styles.emptyPostsContainer}>
            <View style={styles.emptyIconContainer}>
                <ImageIcon size={64} color="#CCCCCC" />
            </View>
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
                Share your first virtual try-on experience
            </Text>
            <TouchableOpacity style={styles.createPostButton}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.createPostText}>Create First Post</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPostGrid = () => (
        <FlatList
            data={userPosts}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.postItem}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.postImage}
                        contentFit="cover"
                    />
                    <View style={styles.postOverlay}>
                        <View style={styles.postStats}>
                            <View style={styles.postStat}>
                                <ThumbsUp size={12} color="#FFFFFF" />
                                <Text style={styles.postStatText}>{item.likes}</Text>
                            </View>
                            <View style={styles.postStat}>
                                <MessageCircle size={12} color="#FFFFFF" />
                                <Text style={styles.postStatText}>{item.comments}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
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
        case "wardrobe":
            return (
                <View style={styles.contentArea}>
                    <Text style={styles.sectionTitle}>Virtual Wardrobe</Text>
                    <View style={styles.wardrobeGrid}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <TouchableOpacity key={item} style={styles.wardrobeItem}>
                                <Image
                                    source={{
                                        uri: `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=${item}`,
                                    }}
                                    style={styles.wardrobeImage}
                                    contentFit="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case "saved":
            return (
                <View style={styles.contentArea}>
                    <Text style={styles.sectionTitle}>Saved Items</Text>
                    <View style={styles.savedGrid}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <TouchableOpacity key={item} style={styles.savedItem}>
                                <Image
                                    source={{
                                        uri: `https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=${item}`,
                                    }}
                                    style={styles.savedImage}
                                    contentFit="cover"
                                />
                                <View style={styles.savedIcon}>
                                    <Bookmark size={20} color="#00BCD4" fill="#00BCD4" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case "activity":
            return (
                <View style={styles.contentArea}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityList}>
                        {[
                            { action: "Liked a post", time: "2 hours ago" },
                            { action: "Followed FashionBrand", time: "1 day ago" },
                            { action: "Saved an outfit", time: "2 days ago" },
                            { action: "Created new avatar", time: "1 week ago" },
                        ].map((item, index) => (
                            <View key={index} style={styles.activityItem}>
                                <View style={styles.activityDot} />
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>{item.action}</Text>
                                    <Text style={styles.activityTime}>{item.time}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
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
