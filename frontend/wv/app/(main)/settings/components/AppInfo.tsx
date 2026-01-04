import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Card } from 'react-native-paper';

const AppInfo: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.appName, { color: colors.text }]}>
          Wear Virtually
        </Text>
        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
          Version 2.0.1 (Build 2024.12.01)
        </Text>
        <Text style={[styles.appCopyright, { color: colors.textTertiary }]}>
          © 2026 Wear Virtually Inc.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    elevation: 0,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
  },
});

export default AppInfo;