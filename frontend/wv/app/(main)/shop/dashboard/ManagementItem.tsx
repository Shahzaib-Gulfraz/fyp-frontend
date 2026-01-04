// src/components/shop/ManagementItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface ManagementItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  isActive?: boolean;
  notificationCount?: number;
}

const ManagementItem: React.FC<ManagementItemProps> = ({
  title,
  description,
  icon,
  onPress,
  isActive = false,
  notificationCount,
}) => {
  const { colors } = useTheme();
  const { radius, fonts, spacing } = appTheme.tokens;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: isActive ? colors.primary : colors.border,
          padding: spacing.md,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isActive ? colors.primary + '15' : colors.surface + '80',
              borderRadius: radius.md,
            },
          ]}
        >
          {React.cloneElement(icon as React.ReactElement, {
            size: 22,
            color: isActive ? colors.primary : colors.textSecondary,
          } as any)}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.semiBold }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {description}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {notificationCount && notificationCount > 0 ? (
          <View
            style={[
              styles.notificationBadge,
              {
                backgroundColor: colors.error,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                styles.notificationText,
                {
                  color: colors.background,
                  fontFamily: fonts.bold,
                },
              ]}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        ) : (
          <Text style={[styles.arrow, { color: colors.textTertiary, fontFamily: fonts.bold }]}>
            ›
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: appTheme.tokens.spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: appTheme.tokens.spacing.md,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  rightSection: {
    marginLeft: appTheme.tokens.spacing.sm,
  },
  notificationBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 11,
  },
  arrow: {
    fontSize: 18,
  },
});

export default ManagementItem;
