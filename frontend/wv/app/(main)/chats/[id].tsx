import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocket } from '@/src/context/SocketContext';
import { chatService } from '@/src/api/chatService';
import { useUser } from '@/src/context/UserContext';
import { Message } from '@/src/types/chat';
import { Send } from 'lucide-react-native';
import { format } from 'date-fns';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams(); // This might be a user ID IF we start chat from profile directly
  // Logic: If ID is existing conversation -> Load messages.
  // If ID is userId (new chat) -> Check if conversation exists, else empty state.
  // Simplifying assumption: routing handles /chats/conversationId. 
  // If routing from profile, we might need to handle /chats/new?userId=...

  // Let's assume ID is ConversationID for now.

  const { theme, tokens } = useTheme();
  const { colors } = theme;
  const { spacing, radius } = tokens;
  const { user } = useUser();
  const { socket } = useSocket();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [recipient, setRecipient] = useState<any>(null); // For header info

  const flatListRef = useRef<FlatList>(null);

  const loadMessages = React.useCallback(async () => {
    try {
      const response = await chatService.getMessages(conversationId as string);

      // Handle messages
      if (response.data?.success && response.data?.data?.messages) {
        setMessages(response.data.data.messages);
      } else if (Array.isArray(response.data?.messages)) {
        setMessages(response.data.messages);
      } else {
        setMessages(response.data?.data?.messages || []);
      }

      // Handle conversation details (New: direct from getMessages)
      const conversationData = response.data?.data?.conversation || response.data?.conversation;
      if (conversationData) {
        // Find other participant directly
        const otherUser = conversationData.participants.find((p: any) => {
          const pId = p._id || p.id;
          const uId = user?.id;
          const u_Id = user?._id;
          // Compare strings to be safe
          return String(pId) !== String(uId) && String(pId) !== String(u_Id);
        });

        if (otherUser) {
          setRecipient(otherUser);
        } else {
          // Fallback if self-chat or logic fails (shouldn't happen)
          console.log("Recipient not found in conversation details", conversationData);
        }
      }

    } catch (error) {
      console.error('Load messages error:', error);
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  // Real-time listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      console.log('[ChatScreen] Real-time message received:', newMessage);
      console.log('[ChatScreen] Comparing IDs:', { msgConvId: newMessage.conversationId, currentConvId: conversationId });

      // Robust check for conversation ID match
      if (String(newMessage.conversationId) === String(conversationId)) {
        console.log('[ChatScreen] Match found! Updating state.');
        setMessages(prev => [newMessage, ...prev]);
      } else {
        console.log('[ChatScreen] No match.');
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    try {
      let targetId = recipient?._id || recipient?.id;

      if (!targetId) {
        console.error("No recipient loaded yet. Cannot send.");
        setInputText(textToSend);
        return;
      }

      // Optimistic update
      const tempMessage: Message = {
        _id: Math.random().toString(),
        conversationId: conversationId as string,
        sender: user?.id || 'me',
        text: textToSend,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setMessages(prev => [tempMessage, ...prev]);

      const response = await chatService.sendMessage(targetId, textToSend);

      const realMessage = response.data?.data?.message || response.data?.message;
      if (realMessage) {
        // Replace temp message or just rely on state update if ID matches?
        // Simpler: Just refresh list or replace the temp one if we tracked it.
        // For now, let's just update the ID or assume the socket event comes in too?
        // If socket comes in, we might have duplicate.
        // Actually, since we emit to recipient, sender DOES NOT get socket event usually (unless broadcast to room).
        // Our backend emits to *recipient* only.
        // So sender needs manual update.
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? realMessage : m));
      }

    } catch (error) {
      console.error('Send error:', error);
      setInputText(textToSend); // Revert
      // Remove temp message if failed
      setMessages(prev => prev.filter(m => m.text !== textToSend));
    }
  };

  // Removed redundant fetchRecipient useEffect since loadMessages handles it now.


  const renderMessageText = (text: string, isMe: boolean) => {
    // Regex to detect /buy/product_id
    // Example: "Check out this product: Shirt Name \n /buy/65a..."
    const productLinkRegex = /(\/buy\/[a-f0-9]{24})/g;

    // Split by regex
    const parts = text.split(productLinkRegex);

    if (parts.length === 1) {
      return (
        <Text style={[styles.messageText, { color: isMe ? '#fff' : colors.text }]}>
          {text}
        </Text>
      );
    }

    return (
      <Text style={[styles.messageText, { color: isMe ? '#fff' : colors.text }]}>
        {parts.map((part, index) => {
          if (part.match(productLinkRegex)) {
            // It's a product link
            return (
              <Text
                key={index}
                style={{
                  fontWeight: 'bold',
                  textDecorationLine: 'underline',
                  color: isMe ? '#FFF' : colors.primary
                }}
                onPress={() => {
                  // Navigate to product
                  const productId = part.split('/buy/')[1];
                  router.push(`/(main)/buy/${productId}`);
                }}
              >
                View Product
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === user?.id || (typeof item.sender === 'object' && (item.sender as any)._id === user?.id);
    const messageTime = new Date(item.createdAt);

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 4
      }}>
        {!isMe && (
          <Image
            source={{ 
              uri: typeof recipient?.profileImage === 'string' 
                ? recipient.profileImage 
                : (recipient?.profileImage as any)?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.username || 'User')}&background=random`
            }}
            style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8, alignSelf: 'flex-end', marginBottom: 4 }}
          />
        )}

        <View style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
          {
            backgroundColor: isMe ? colors.primary : colors.surface,
            borderColor: isMe ? colors.primary : colors.border,
            borderWidth: isMe ? 0 : 1
          }
        ]}>
          {renderMessageText(item.text, isMe)}
          <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
            {format(messageTime, 'HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ 
                  uri: typeof recipient?.profileImage === 'string' 
                    ? recipient.profileImage 
                    : (recipient?.profileImage as any)?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.username || 'User')}&background=random`
                }}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
              />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {recipient?.username || 'Chat'}
              </Text>
            </View>
          ),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item._id || Math.random().toString()}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: spacing.md }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.background,
            color: colors.text,
            borderRadius: radius.full
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()}>
          <Send size={24} color={inputText.trim() ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  }
});