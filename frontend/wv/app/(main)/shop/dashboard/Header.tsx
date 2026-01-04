// src/components/shop/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = "My Shop",
  subtitle = "Fashion Store • Active Now",
  showBack = false,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;
  const router = useRouter();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }
    ]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.full,
              }
            ]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.shopLogo}>
            <View style={[
              styles.logoPlaceholder,
              { backgroundColor: colors.primary, borderRadius: radius.full }
            ]}>
              <Text style={[
                styles.logoText,
                { color: colors.background, fontFamily: fonts.bold }
              ]}>
                FS
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <Text style={[
          styles.title,
          { 
            color: colors.text,
            fontFamily: fonts.semiBold,
            fontSize: 18,
          }
        ]}>
          {title}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: '#4CAF50' }
          ]} />
          <Text style={[
            styles.subtitle,
            { 
              color: colors.textSecondary,
              fontFamily: fonts.regular,
              fontSize: 12,
            }
          ]}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={() => router.push('/shop/settings')}
          style={[
            styles.iconButton,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.full,
            }
          ]}
        >
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shopLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 12,
  },
});

export default Header;
