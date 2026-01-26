import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Star, Heart } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { appTheme } from "@/src/theme/appTheme";
import { ClothingItem } from "../types";

/* ---------- Helper ---------- */
const getColorDisplayName = (color: string) => {
  const map: Record<string, string> = {
    black: "Black",
    white: "White",
    red: "Red",
    blue: "Blue",
    green: "Green",
    yellow: "Yellow",
    gray: "Gray",
    navy: "Navy",
    multi: "Multi-color",
    pink: "Pink",
  };
  return map[color.toLowerCase()] || color;
};

interface ClothingInfoProps {
  item: ClothingItem;
  isSaved: boolean;
  onToggleSave: () => void;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
}

const ClothingInfo: React.FC<ClothingInfoProps> = ({
  item,
  isSaved,
  onToggleSave,
  selectedSize,
  selectedColor,
  onSelectSize,
  onSelectColor,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xl,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: fonts.medium,
              fontSize: 14,
              marginBottom: spacing.xs,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {item.brand}
          </Text>

          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 24,
              lineHeight: 32,
            }}
          >
            {item.name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onToggleSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: isSaved ? colors.error + "15" : colors.surface,
              borderColor: isSaved ? colors.error : colors.border,
              borderRadius: radius.full,
            },
          ]}
        >
          <Heart
            size={22}
            color={isSaved ? colors.error : colors.textSecondary}
            fill={isSaved ? colors.error : "transparent"}
          />
        </TouchableOpacity>
      </View>

      {/* PRICE & RATING SECTION */}
      <View
        style={{
          paddingBottom: spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 28,
              lineHeight: 36,
            }}
          >
            {item.price}
          </Text>

          {item.originalPrice && (
            <Text
              style={{
                color: colors.textTertiary,
                fontFamily: fonts.regular,
                fontSize: 16,
                textDecorationLine: "line-through",
                marginLeft: spacing.sm,
              }}
            >
              {item.originalPrice}
            </Text>
          )}

          {item.discount && (
            <View
              style={{
                backgroundColor: colors.error,
                marginLeft: spacing.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: radius.sm,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: fonts.bold,
                  fontSize: 12,
                  lineHeight: 16,
                }}
              >
                {item.discount} OFF
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: spacing.sm }}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text
              style={{
                marginLeft: spacing.xs,
                fontFamily: fonts.semiBold,
                color: colors.text,
                fontSize: 16,
              }}
            >
              {item.rating}
            </Text>
          </View>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: fonts.regular,
              fontSize: 14,
            }}
          >
            ({item.reviews} reviews)
          </Text>
        </View>
      </View>

      {/* DESCRIPTION (if exists) */}
      {item.description && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              color: colors.textTertiary,
              fontFamily: fonts.medium,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: spacing.xs,
            }}
          >
            Description
          </Text>
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.regular,
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            {item.description}
          </Text>
        </View>
      )}

      {/* SIZE SELECTION */}
      {item.sizes && item.sizes.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <Text
              style={{
                fontFamily: fonts.semiBold,
                fontSize: 16,
                color: colors.text,
              }}
            >
              Select Size
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 14,
                  color: colors.primary,
                }}
              >
                Size Guide
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.lg }}
          >
            {item.sizes.map((size) => {
              const selected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => onSelectSize(size)}
                  style={{
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginRight: spacing.sm,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    minWidth: 60,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: selected ? colors.background : colors.text,
                      fontFamily: selected ? fonts.semiBold : fonts.medium,
                      fontSize: 14,
                    }}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* COLOR SELECTION */}
      {item.colors && item.colors.length > 0 && (
        <View>
          <Text
            style={{
              fontFamily: fonts.semiBold,
              fontSize: 16,
              marginBottom: spacing.md,
              color: colors.text,
            }}
          >
            Select Color
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.lg }}
          >
            {item.colors.map((color) => {
              const selected = selectedColor === color;
              const displayName = getColorDisplayName(color);
              const isLightColor = ["white", "yellow", "pink", "multi"].includes(color.toLowerCase());

              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => onSelectColor(color)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: spacing.sm,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.md,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: color.toLowerCase(),
                      borderWidth: isLightColor ? 1 : 0,
                      borderColor: colors.border,
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: spacing.sm,
                      fontFamily: selected ? fonts.semiBold : fonts.medium,
                      color: colors.text,
                      fontSize: 14,
                    }}
                  >
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  saveButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});

export default ClothingInfo;