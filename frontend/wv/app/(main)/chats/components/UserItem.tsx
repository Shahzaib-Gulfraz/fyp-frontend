import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { User } from '../types';

interface UserItemProps {
  user: User;
  onPress: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.userItem, { borderBottomColor: colors.divider }]}
      onPress={onPress}
    >
      <Image
        source={{ uri: typeof user.avatar === 'string' ? user.avatar : user.avatar?.url || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.userStatus, { color: colors.textSecondary }]}>{user.status}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
  },
});

export default UserItem;