import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Send } from 'lucide-react-native';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type a message...',
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.inputContainer,
      {
        backgroundColor: colors.surface,
        borderTopColor: colors.divider
      }
    ]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#333' : '#F6F6F6',
            color: colors.text
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { 
            backgroundColor: value.trim() 
              ? colors.primary 
              : (isDark ? '#333' : '#E0E0E0') 
          }
        ]}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Send size={20} color={value.trim() ? '#FFFFFF' : '#999'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageInput;