import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Badge } from 'react-native-paper';
import { ArrowLeft, Bell, Share2, LogOut } from 'lucide-react-native';
import { useTheme, AppTokensType, ThemeColors } from '@/src/context/ThemeContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onNotification?: () => void;
  onShare?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
}

const ShopProfileHeader: React.FC<HeaderProps> = ({
  title,
  onBack,
  onNotification,
  onShare,
  onLogout,
  notificationCount = 0,
}) => {
  const { colors, tokens } = useTheme();

  // fallback in case tokens are undefined
  const spacing: AppTokensType['spacing'] = tokens?.spacing ?? { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

  return (
    <Appbar.Header style={[styles.header, { backgroundColor: colors.background }]}>

      {/* BACK BUTTON */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}

      {/* TITLE */}
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* ACTIONS */}
      <View style={styles.actions}>
        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Share2 size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {onNotification && (
          <View style={styles.notificationWrapper}>
            <TouchableOpacity onPress={onNotification} style={styles.iconButton}>
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>

            {notificationCount > 0 && (
              <Badge
                size={16}
                style={[styles.badge, { backgroundColor: colors.error, color: colors.onPrimary }]}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </View>
        )}
        {onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
            <LogOut size={20} color={colors.error || '#f00'} />
          </TouchableOpacity>
        )}
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationWrapper: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
  },
});

export default ShopProfileHeader;
