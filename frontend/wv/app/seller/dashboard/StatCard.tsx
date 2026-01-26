// src/components/shop/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  onPress?: () => void;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  onPress,
  trend = 'up',
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const isPositive = trend === 'up';
  const changeColor = isPositive ? colors.success : colors.error;

  const CardContent = () => (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.md,
        },
      ]}
    >
      {/* Header: Icon + Label */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '15', borderRadius: radius.full },
          ]}
        >
          {icon}
        </View>
        <Text
          style={[
            styles.label,
            {
              color: colors.textTertiary,
              fontFamily: fonts.medium,
              marginLeft: spacing.sm,
            },
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </View>

      {/* Value */}
      <Text
        style={[
          styles.value,
          {
            color: colors.text,
            fontFamily: fonts.bold,
            marginTop: spacing.sm,
          },
        ]}
      >
        {value}
      </Text>

      {/* Footer: Change + Timeframe */}
      <View style={[styles.footer, { marginTop: spacing.sm }]}>
        <View style={styles.changeContainer}>
          {trend !== 'neutral' &&
            (isPositive ? (
              <TrendingUp size={16} color={changeColor} />
            ) : (
              <TrendingDown size={16} color={changeColor} />
            ))}
          <Text
            style={[
              styles.changeText,
              { color: changeColor, fontFamily: fonts.semiBold, marginLeft: 6 },
            ]}
          >
            {change}
          </Text>
        </View>
        <Text
          style={[
            styles.timeframe,
            { color: colors.textTertiary, fontFamily: fonts.regular },
          ]}
        >
          vs last 7 days
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 150,
    maxWidth: 200,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeframe: {
    fontSize: 10,
  },
});

export default StatCard;
