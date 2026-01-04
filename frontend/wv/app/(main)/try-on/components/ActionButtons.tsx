import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ShoppingCart, Camera, Share2, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/context/ThemeContext";
import { appTheme } from "@/src/theme/appTheme";

interface ActionButtonsProps {
  onBuyNow?: () => void;
  onPost: () => void;
  onShare: () => void;
  isSaved?: boolean;
  onSave?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBuyNow,
  onPost,
  onShare,
  isSaved = false,
  onSave,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const handleBuyNow = () => {
    if (onBuyNow) onBuyNow();
    router.push("/buy"); // Navigate to /buy page
  };

  const actions = [
    {
      id: "post",
      label: "Post to Feed",
      subLabel: "Share your look",
      icon: Camera,
      color: colors.text,
      bgColor: colors.surface,
      textColor: colors.text,
      onPress: onPost,
    },
    {
      id: "share",
      label: "Share",
      subLabel: "With friends",
      icon: Share2,
      color: colors.text,
      bgColor: colors.surface,
      textColor: colors.text,
      onPress: onShare,
    },
    {
      id: "save",
      label: isSaved ? "Saved" : "Save",
      subLabel: "For later",
      icon: Heart,
      color: isSaved ? colors.error : colors.textSecondary,
      bgColor: colors.surface,
      textColor: isSaved ? colors.error : colors.textSecondary,
      onPress: onSave,
      show: !!onSave,
    },
  ];

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(300)}
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* BUY NOW BUTTON */}
      <TouchableOpacity
        onPress={handleBuyNow}
        activeOpacity={0.9}
        style={[
          styles.primaryAction,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.lg,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.md,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          },
        ]}
      >
        <View style={styles.primaryActionContent}>
          <View style={styles.primaryIconContainer}>
            <ShoppingCart size={24} color="#ffffff" />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text
                style={[
                  styles.primaryLabel,
                  {
                    color: "#ffffff",
                    fontFamily: fonts.bold,
                  },
                ]}
              >
                Buy Now
              </Text>
              <Text
                style={[
                  styles.primarySubLabel,
                  {
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: fonts.regular,
                  },
                ]}
              >
                Secure checkout • Free shipping
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.background + "20",
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
              },
            ]}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: fonts.bold,
                fontSize: 12,
              }}
            >
              $129.99
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* SECONDARY ACTIONS */}
      <View style={styles.secondaryGrid}>
        {actions
          .filter((a) => a.id !== "save" || a.show)
          .map((action) => {
            const Icon = action.icon;

            return (
              <TouchableOpacity
                key={action.id}
                onPress={action.onPress}
                activeOpacity={0.8}
                style={[
                  styles.secondaryAction,
                  {
                    backgroundColor: action.bgColor,
                    borderRadius: radius.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xs,
                    marginHorizontal: spacing.xs,
                    borderWidth: action.id === "save" && isSaved ? 1 : 0,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Icon
                  size={22}
                  color={action.color}
                  fill={
                    action.id === "save" && isSaved
                      ? colors.error
                      : "transparent"
                  }
                />
                <Text
                  style={[
                    styles.secondaryLabel,
                    {
                      color: action.textColor,
                      fontFamily: fonts.medium,
                      marginTop: spacing.xs,
                    },
                  ]}
                >
                  {action.label}
                </Text>
                {action.subLabel && (
                  <Text
                    style={[
                      styles.secondarySubLabel,
                      {
                        color: colors.textTertiary,
                        fontFamily: fonts.regular,
                      },
                    ]}
                  >
                    {action.subLabel}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "column" },
  primaryAction: {},
  primaryActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  primaryLabel: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  primarySubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderRadius: 6,
  },
  secondaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  secondarySubLabel: {
    fontSize: 10,
    textAlign: "center",
  },
});

export default ActionButtons;
