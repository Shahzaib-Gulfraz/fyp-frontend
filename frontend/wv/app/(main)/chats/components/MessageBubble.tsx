import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { colors, isDark } = useTheme();
  const isMe = message.sender === 'me';

  return (
    <View style={[
      styles.messageWrapper,
      isMe ? styles.myMessageWrapper : styles.theirMessageWrapper
    ]}>
      <View style={[
        styles.messageBubble,
        isMe
          ? { backgroundColor: colors.primary }
          : { backgroundColor: isDark ? colors.surface : '#F0F0F0' }
      ]}>
        <Text style={[
          styles.messageText,
          isMe
            ? { color: '#FFFFFF' }
            : { color: colors.text }
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isMe
            ? { color: 'rgba(255,255,255,0.7)' }
            : { color: colors.textTertiary }
        ]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  theirMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;