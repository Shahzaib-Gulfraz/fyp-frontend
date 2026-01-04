import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { ArrowLeft, Phone, Video } from 'lucide-react-native';
import { Image } from 'expo-image';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  avatar?: string;
  onBack: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatar,
  onBack,
  onCall,
  onVideoCall,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.divider }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        {avatar && (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
        <View>
          <Text style={[styles.headerName, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.headerStatus, { color: colors.success }]}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        {onCall && (
          <TouchableOpacity style={styles.headerAction} onPress={onCall}>
            <Phone size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        {onVideoCall && (
          <TouchableOpacity style={styles.headerAction} onPress={onVideoCall}>
            <Video size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 4,
  },
});

export default ChatHeader;