import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { Chat } from '../types';

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.divider }]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: chat.user.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        {chat.user.online && (
          <View style={[styles.onlineIndicator, { borderColor: colors.background }]} />
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, { color: colors.text }]}>{chat.user.name}</Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{chat.time}</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text
            style={[
              styles.lastMessage,
              {
                color: chat.unread > 0 ? colors.text : colors.textSecondary,
                fontWeight: chat.unread > 0 ? '600' : '400',
              }
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>

          {chat.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ChatItem;