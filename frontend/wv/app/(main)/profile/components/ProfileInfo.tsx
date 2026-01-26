import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Camera, Mail, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ProfileInfoProps {
    theme: any;
    user: any;
    userPosts: any[];
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
}

export const ProfileInfo = ({ theme, user, userPosts, fadeAnim, scaleAnim }: ProfileInfoProps) => {
    const router = useRouter();
    const styles = getStyles(theme.colors);

    console.log('ProfileInfo - User object:', user);
    console.log('ProfileInfo - Friends:', user?.friends);
    console.log('ProfileInfo - Friends length:', user?.friends?.length);
    console.log('ProfileInfo - Posts:', userPosts);
    console.log('ProfileInfo - Posts length:', userPosts?.length);

    return (
        <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
                <Animated.View
                    style={[
                        styles.profileImageContainer,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <Image
                        source={{
                            uri: typeof user.profileImage === 'string'
                                ? user.profileImage
                                : user.profileImage?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
                        }}
                        style={styles.profileImage}
                        contentFit="cover"
                        transition={300}
                    />
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => router.push("/(main)/profile/edit")}
                    >
                        <Camera size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.userStats}>
                    <View style={styles.statColumn}>
                        <Text style={styles.statNumber}>{userPosts.length}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statColumn}>
                        <Text style={styles.statNumber}>{user.friends?.length || 0}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </View>
                </View>
            </View>

            <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.fullName}</Text>
                {user.bio ? (
                    <Text style={styles.userBio}>
                        {user.bio}
                    </Text>
                ) : null}

                <View style={styles.contactInfo}>
                    <View style={styles.contactItem}>
                        <Mail size={14} color="#666666" />
                        <Text style={styles.contactText}>{user.email}</Text>
                    </View>
                    {user.location ? (
                        <View style={styles.contactItem}>
                            <MapPin size={14} color="#666666" />
                            <Text style={styles.contactText}>{user.location}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        profileHeader: {
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        profileInfo: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
        },
        profileImageContainer: {
            position: "relative",
            marginRight: 30,
        },
        profileImage: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: colors.background,
        },
        cameraButton: {
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#00BCD4",
            width: 30,
            height: 30,
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: colors.background,
        },
        userStats: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
        },
        statColumn: {
            alignItems: "center",
        },
        statNumber: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
        },
        statLabel: {
            fontSize: 13,
            color: "#666666",
            marginTop: 4,
        },
        userDetails: {
            marginBottom: 25,
        },
        userName: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 6,
        },
        userBio: {
            fontSize: 14,
            color: "#666666",
            lineHeight: 20,
            marginBottom: 15,
        },
        contactInfo: {
            gap: 10,
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        contactText: {
            fontSize: 13,
            color: "#666666",
        },
    });
