// src/components/shop/QuickActionCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
  onPress: () => void;
  badge?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  badge,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
        }
      ]}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: iconColor + '15' || colors.primary + '15',
              borderRadius: radius.full,
            }
          ]}>
            {React.cloneElement(icon as React.ReactElement, {
              size: 22,
              color: iconColor || colors.primary,
            } as any)}
          </View>

          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: fonts.semiBold,
                fontSize: 16,
              }
            ]}>
              {title}
            </Text>
            <Text style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontFamily: fonts.regular,
                fontSize: 12,
              }
            ]}>
              {description}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {badge && (
            <View style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.sm,
                marginRight: spacing.sm,
              }
            ]}>
              <Text style={[
                styles.badgeText,
                {
                  color: colors.background,
                  fontFamily: fonts.medium,
                  fontSize: 10,
                }
              ]}>
                {badge}
              </Text>
            </View>
          )}
          <ArrowRight size={20} color={colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: appTheme.tokens.spacing.md,
    marginBottom: appTheme.tokens.spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default QuickActionCard;