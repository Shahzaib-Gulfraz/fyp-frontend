import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { IconButton } from 'react-native-paper';
import { Moon, Sun } from 'lucide-react-native';

interface SettingsHeaderProps {
  title: string;
  onBack: () => void;
  onToggleTheme: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onBack, onToggleTheme }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.divider }]}>
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={onBack}
          iconColor={colors.text}
          style={styles.backButton}
        />

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        <IconButton
          icon={() => isDark ? <Sun size={20} color={colors.text} /> : <Moon size={20} color={colors.text} />}
          onPress={onToggleTheme}
          style={[styles.themeButton, { backgroundColor: colors.surface }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    margin: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  themeButton: {
    margin: 0,
  },
});

export default SettingsHeader;