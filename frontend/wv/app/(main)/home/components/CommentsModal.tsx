// app/(main)/home/components/CommentsModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { X, Send, Heart } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from '../styles';

interface Comment {
  id: string;
  user: string;
  userAvatar: string;
  text: string;
  time: string;
  likes: number;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
  slideAnim: Animated.Value;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  comments,
  commentText,
  setCommentText,
  onAddComment,
  slideAnim,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Comments Panel */}
        <Animated.View
          style={[
            styles.commentsPanel,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Comments Header */}
          <View style={[styles.commentsHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
                <Image
                  source={{ uri: item.userAvatar }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentUser, { color: colors.text }]}>
                      {item.user}
                    </Text>
                    <Text style={[styles.commentTime, { color: colors.textTertiary }]}>
                      {item.time}
                    </Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.text }]}>
                    {item.text}
                  </Text>
                  <TouchableOpacity style={styles.commentLikeButton}>
                    <Heart size={14} color={colors.textSecondary} />
                    <Text style={[styles.commentLikeCount, { color: colors.textSecondary }]}>
                      {item.likes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Heart size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>
                  No comments yet
                </Text>
                <Text style={[styles.emptyCommentsSubText, { color: colors.textTertiary }]}>
                  Be the first to comment!
                </Text>
              </View>
            }
          />

          {/* Comment Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.commentInputContainer, { borderTopColor: colors.border }]}
          >
            <View style={[styles.commentInputWrapper, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.commentInput, { color: colors.text }]}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: commentText.trim() ? colors.primary : colors.border }
                ]}
                onPress={onAddComment}
                disabled={!commentText.trim()}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};