// app/(main)/home/components/HomeHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from '../styles';

interface HomeHeaderProps {
  insets: {
    top: number;
  };
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ insets }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.header, {
      paddingTop: insets.top + 10,
      backgroundColor: colors.background,
      borderBottomColor: colors.divider
    }]}>
      <View style={styles.headerContent}>
        <Text style={[styles.logo, { color: colors.text }]}>WearVirtually</Text>
        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: isDark ? colors.surface : '#FFF5F7' }]}
          onPress={() => router.push("/(main)/saved-items")}
        >
          <Heart size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};