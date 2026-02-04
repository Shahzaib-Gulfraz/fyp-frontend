import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { chatService } from '@/src/api/chatService';
import shopChatService from '@/src/api/shopChatService';
import { Conversation } from '@/src/types/chat';
import { useUser } from '@/src/context/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/src/context/SocketContext';
import { ShoppingCart, Bell, Heart, ArrowLeft, Store } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatListScreen() {
  const { theme, tokens } = useTheme();
  const { colors } = theme;
  const { radius } = tokens;
  const router = useRouter();
  const { user } = useUser();
  const { socket, unreadNotifications } = useSocket();
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const loadConversations = async () => {
    try {
      // Backend now returns both friend and shop conversations
      const response = await chatService.getConversations();
      const chats = response.data?.data?.conversations || response.data?.conversations || [];
      
      // Sort by last message time (most recent first)
      const sortedChats = chats.sort((a: any, b: any) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(sortedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const { default: cartService } = await import('@/src/api/cartService');
      const response = await cartService.getCart();
      if (response?.cart?.items) {
        const totalItems = response.cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartItemCount(totalItems);
      }
    } catch (error) {
      console.log('Failed to fetch cart count:', error);
    }
  };

  useEffect(() => {
    loadConversations();
    fetchCartCount();
  }, []);

  // Real-time update listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('[Chat List] New message received:', data);
      // Re-fetch conversations to update last message and unread counts
      loadConversations();
    };

    const handleMessageRead = () => {
      // Refresh when messages are marked as read
      loadConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message:new', handleNewMessage);
    socket.on('messages_read', handleMessageRead);
    
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message:new', handleNewMessage);
      socket.off('messages_read', handleMessageRead);
    };
  }, [socket]);

  const renderItem = ({ item }: { item: any }) => {
    const isShopConversation = item.conversationType === 'user-to-shop' || item.shopId;
    
    let displayName = 'Unknown';
    let displayImage = '';
    let unreadCount = 0;

    if (isShopConversation) {
      // Shop conversation
      const shop = item.shopId;
      if (shop && typeof shop === 'object') {
        displayName = shop.shopName || shop.shopUsername || 'Shop';
        const rawLogo = shop.logo;
        displayImage = typeof rawLogo === 'string'
          ? rawLogo
          : (rawLogo as any)?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4CAF50`;
      } else {
        displayImage = `https://ui-avatars.com/api/?name=Shop&background=4CAF50`;
      }
      
      // Get unread count for user
      if (item.unreadCount && user?.id) {
        unreadCount = item.unreadCount[user.id] || 0;
      }
    } else {
      // Friend conversation
      const otherParticipant = item.participants?.find((p: any) => p._id !== user?.id && p.id !== user?.id) || item.participants?.[0];
      const isSelf = !otherParticipant || (otherParticipant._id === user?.id);

      displayName = isSelf ? 'Me' : (otherParticipant?.username || 'User');
      const rawImage = !isSelf && otherParticipant?.profileImage ? otherParticipant.profileImage : null;
      displayImage = typeof rawImage === 'string' 
        ? rawImage 
        : (rawImage as any)?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
      
      // Get unread count for user
      if (item.unreadCount && user?.id) {
        unreadCount = item.unreadCount[user.id] || 0;
      }
    }

    const navigateTo = isShopConversation 
      ? `/chats/shop/${item.shopId?._id || item.shopId}`
      : `/chats/${item._id}`;

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { borderBottomColor: colors.border }]}
        onPress={() => router.push(navigateTo as any)}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: displayImage }}
            style={[styles.avatar, { borderRadius: radius.full }]}
          />
          {isShopConversation && (
            <View style={[styles.shopBadge, { backgroundColor: colors.primary }]}>
              <Store size={12} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            {item.lastMessage && item.lastMessage.createdAt && (
              <Text style={[styles.time, { color: colors.textSecondary }]}>
                {(() => {
                  try {
                    return formatDistanceToNow(new Date(item.lastMessage.createdAt), { addSuffix: false });
                  } catch {
                    return '';
                  }
                })()}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {item.lastMessage ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.lastMessage,
                  { 
                    color: unreadCount > 0 ? colors.text : colors.textSecondary,
                    fontWeight: unreadCount > 0 ? '600' : 'normal',
                    flex: 1
                  }
                ]}
              >
                {item.lastMessage.sender === user?.id ? 'You: ' : ''}{item.lastMessage.text}
              </Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', flex: 1 }}>No messages yet</Text>
            )}
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <Stack.Screen options={{ title: 'Messages', headerShadowVisible: false }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 10,
        backgroundColor: colors.background,
        borderBottomColor: colors.divider
      }]}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
               <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.logo, { color: colors.text }]}>Messages</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
              onPress={() => router.push("/(main)/notifications")}
            >
              <Bell size={24} color={colors.primary} />
              {unreadNotifications > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, position: 'relative' }]}
              onPress={() => router.push("/(main)/cart")}
            >
              <ShoppingCart size={24} color={colors.primary} />
              {cartItemCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Text style={styles.badgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/(main)/saved-items")}
            >
              <Heart size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadConversations(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary }}>No conversations yet.</Text>
            <Text style={{ color: colors.primary, marginTop: 8 }} onPress={() => router.push('/friends')}>
              Start a chat with friends!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  shopBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});