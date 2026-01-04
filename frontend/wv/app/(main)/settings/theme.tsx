import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { List } from 'react-native-paper';
import { Moon, Sun, Smartphone, Check } from 'lucide-react-native';

type ThemeMode = 'light' | 'dark' | 'system';

const ThemeSettings = () => {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: <Sun size={24} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />,
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: <Moon size={24} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />,
    },
    {
      mode: 'system',
      label: 'System',
      icon: <Smartphone size={24} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <List.Section>
        <List.Subheader style={[styles.subheader, { color: colors.text }]}>
          Theme Settings
        </List.Subheader>
        
        <List.Item
          title="Back"
          left={() => <List.Icon icon="arrow-left" color={colors.text} />}
          onPress={() => router.back()}
          titleStyle={{ color: colors.text }}
        />
      </List.Section>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>THEME</Text>
        
        <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
          {themeOptions.map((option, index) => (
            <List.Item
              key={option.mode}
              title={option.label}
              left={() => (
                <View style={[styles.iconContainer, { backgroundColor: colors.surface + '80' }]}>
                  {option.icon}
                </View>
              )}
              right={() => themeMode === option.mode && (
                <Check size={20} color={colors.primary} />
              )}
              onPress={() => setThemeMode(option.mode)}
              style={[
                styles.option,
                { borderBottomColor: colors.divider, borderBottomWidth: index < themeOptions.length - 1 ? 1 : 0 }
              ]}
              titleStyle={{ color: colors.text }}
            />
          ))}
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Select your preferred appearance. System setting will automatically adjust based on your device&apos;s display settings.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subheader: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  description: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
});

export default ThemeSettings;