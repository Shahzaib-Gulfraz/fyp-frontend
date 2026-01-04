// StorefrontHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface StorefrontHeaderProps {
  isLoading: boolean;
  onSave: () => void;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({ isLoading, onSave }) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const router = useRouter();
  const styles = getStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/shop/dashboard')}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>Configure Storefront</Text>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={isLoading}
        >
          <Save size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: colors.text,
    },
    saveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
  });