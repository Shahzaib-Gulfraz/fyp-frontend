import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  IconButton,
  Divider,
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useTheme, AppTokensType, ThemeColors } from '@/src/context/ThemeContext';

interface ShareProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
  shopName: string;
  profileUrl: string;
}

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  visible,
  onDismiss,
  shopName,
  profileUrl,
}) => {
  const { colors, tokens } = useTheme();
  const styles = makeStyles(colors, tokens);

  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(`Check out ${shopName}'s profile!`);

  const shareOptions = [
    {
      id: 'copy',
      title: 'Copy Link',
      icon: 'content-copy',
      color: colors.primary,
      action: async () => {
        await Clipboard.setStringAsync(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Alert.alert('Copied!', 'Profile link copied to clipboard');
      },
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Alert.alert('Share via WhatsApp', 'This would open WhatsApp with the share message.'),
    },
    {
      id: 'instagram',
      title: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      action: () => Alert.alert('Share via Instagram', 'This would open Instagram with the share message.'),
    },
    {
      id: 'facebook',
      title: 'Facebook',
      icon: 'logo-facebook',
      color: '#1877F2',
      action: () => Alert.alert('Share via Facebook', 'This would open Facebook with the share message.'),
    },
    {
      id: 'twitter',
      title: 'Twitter',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      action: () => Alert.alert('Share via Twitter', 'This would open Twitter with the share message.'),
    },
    {
      id: 'message',
      title: 'Message',
      icon: 'chatbubble-outline',
      color: colors.accent,
      action: () => Alert.alert('Share via Message', 'This would open your messaging app.'),
    },
  ];

  const handleNativeShare = async () => {
    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(profileUrl, {
          dialogTitle: `Share ${shopName} Profile`,
          mimeType: 'text/plain',
        });
      } catch {
        Alert.alert('Error', 'Failed to share profile');
      }
    } else {
      Alert.alert('Error', 'Sharing not available on this device');
    }
  };

  const generateQRCode = () => {
    Alert.alert('QR Code', 'This would generate a QR code for the profile URL.');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Share Profile</Text>
          <IconButton icon="close" iconColor={colors.text} size={24} onPress={onDismiss} />
        </View>

        {/* Profile Link */}
        <Card style={styles.linkCard}>
          <Card.Content>
            <Text style={styles.linkLabel}>Profile Link</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1}>{profileUrl}</Text>
              <IconButton
                icon={copied ? 'check' : 'content-copy'}
                iconColor={copied ? colors.success : colors.primary}
                size={20}
                onPress={shareOptions[0].action}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Custom Message */}
        <Card style={styles.messageCard}>
          <Card.Content>
            <Text style={styles.messageLabel}>Custom Message</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.messageInput}
            />
          </Card.Content>
        </Card>

        {/* Share Options */}
        <Text style={styles.shareTitle}>Share via</Text>
        <View style={styles.shareGrid}>
          {shareOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.shareOption} onPress={option.action}>
              <View style={[styles.shareIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <Text style={styles.shareOptionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <Button
            mode="outlined"
            icon="qrcode"
            onPress={generateQRCode}
            style={styles.qrButton}
          >
            Generate QR Code
          </Button>

          {Platform.OS !== 'web' && (
            <Button
              mode="contained"
              icon="share-variant"
              onPress={handleNativeShare}
              style={styles.nativeShareButton}
            >
              Share via...
            </Button>
          )}
        </View>
      </Modal>
    </Portal>
  );
};

const makeStyles = (colors: ThemeColors, tokens: AppTokensType) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.background,
      marginHorizontal: tokens.spacing.lg,
      marginVertical: tokens.spacing.xl,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.md,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.md,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    linkCard: {
      backgroundColor: colors.surface,
      marginBottom: tokens.spacing.md,
    },
    linkLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: tokens.spacing.sm,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderRadius: tokens.radius.sm,
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
    },
    linkText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: tokens.spacing.sm,
    },
    messageCard: {
      backgroundColor: colors.surface,
      marginBottom: tokens.spacing.lg,
    },
    messageLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: tokens.spacing.sm,
    },
    messageInput: {
      backgroundColor: colors.background,
    },
    shareTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: tokens.spacing.md,
    },
    shareGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: tokens.spacing.md,
    },
    shareOption: {
      width: '30%',
      alignItems: 'center',
      marginBottom: tokens.spacing.md,
    },
    shareIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
    },
    shareOptionText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    divider: {
      backgroundColor: colors.divider,
      marginVertical: tokens.spacing.sm,
    },
    additionalActions: {
      marginTop: tokens.spacing.sm,
    },
    qrButton: {
      marginBottom: tokens.spacing.sm,
      borderColor: colors.primary,
    },
    nativeShareButton: {
      backgroundColor: colors.accent,
    },
  });

export default ShareProfileModal;
