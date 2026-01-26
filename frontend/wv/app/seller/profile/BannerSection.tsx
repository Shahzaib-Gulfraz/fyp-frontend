// src/components/storefront/BannerSection.tsx
import React, { useState } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { Text, Avatar, Button, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/context/ThemeContext";
import { appTheme } from "@/src/theme/appTheme";


interface BannerSectionProps {
  shop: {
    name: string;
    ownerName: string;
    avatar?: string;
    banner?: string;
    isVerified?: boolean;
    isFollowing?: boolean;
    since?: string;
  };
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

const BannerSection: React.FC<BannerSectionProps> = ({ shop, onEdit, onFollow, onMessage }) => {
  const { colors, tokens } = useTheme();
  const styles = makeStyles(colors, tokens);
  const [isFollowing, setIsFollowing] = useState(shop.isFollowing || false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  return (
    <View style={styles.container}>
      {/* Banner Image */}
      <ImageBackground
        source={
          shop.banner
            ? { uri: shop.banner }
            : { uri: "https://placehold.co/1200x300" }
        }
        style={styles.banner}
        resizeMode="cover"
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.bannerOverlay} />
        {onEdit && (
          <IconButton icon="pencil" iconColor="#fff" size={20} style={styles.editButton} onPress={onEdit} />
        )}
      </ImageBackground>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={100}
            source={shop.avatar ? { uri: shop.avatar } : { uri: "https://placehold.co/100" }}
            style={styles.avatar}
          />
          {shop.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <View style={styles.ownerContainer}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} /><Text style={styles.ownerName}> {shop.ownerName}</Text>
            </View>
          </View>

          {shop.since && (
            <View style={styles.sinceContainer}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} /><Text style={styles.sinceText}> Member since {shop.since}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {onMessage ? (
              <Button mode="contained" icon="message-text" onPress={onMessage} style={styles.messageButton} contentStyle={styles.buttonContent}>
                Message
              </Button>
            ) : (
              <Button mode="contained" icon={isFollowing ? "check" : "plus"} onPress={handleFollow} style={styles.followButton} contentStyle={styles.buttonContent}>
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}

            <Button mode="outlined" icon="storefront" onPress={() => { }} style={styles.shopButton} contentStyle={styles.buttonContent}>
              Visit Shop
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (colors: typeof appTheme.light.colors, tokens: typeof appTheme.tokens) =>
  StyleSheet.create({
    container: { position: "relative" },
    banner: { width: "100%", height: 180 },
    bannerOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
    editButton: { position: "absolute", top: tokens.spacing.sm, right: tokens.spacing.sm, backgroundColor: "rgba(0,0,0,0.5)" },
    profileContainer: { flexDirection: "row", paddingHorizontal: tokens.spacing.lg, marginTop: -50, marginBottom: tokens.spacing.md },
    avatarContainer: { position: "relative" },
    avatar: { borderWidth: 4, borderColor: colors.background, backgroundColor: colors.surface },
    verifiedBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: colors.background, borderRadius: 12 },
    infoContainer: { flex: 1, marginLeft: tokens.spacing.lg, justifyContent: "center" },
    nameContainer: { marginBottom: tokens.spacing.sm },
    shopName: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 4 },
    ownerContainer: { flexDirection: "row", alignItems: "center" },
    ownerName: { fontSize: 14, color: colors.textSecondary },
    sinceContainer: { flexDirection: "row", alignItems: "center", marginBottom: tokens.spacing.md },
    sinceText: { fontSize: 12, color: colors.textSecondary },
    actionButtons: { flexDirection: "row", gap: tokens.spacing.sm },
    followButton: { flex: 1, backgroundColor: colors.primary },
    messageButton: { flex: 1, backgroundColor: colors.accent },
    shopButton: { flex: 1, borderColor: colors.primary },
    buttonContent: { height: 36 },
  });

export default BannerSection;
