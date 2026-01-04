import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { List } from 'react-native-paper';
import { SettingsSection as SettingsSectionType } from '../types';

interface SettingsSectionProps {
  section: SettingsSectionType;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ section }) => {
  const { colors } = useTheme();

  // Clone icon with theme color
  const renderIcon = () => {
    if (React.isValidElement(section.icon)) {
      return React.cloneElement(section.icon as React.ReactElement<any>, { color: colors.primary });
    }
    return section.icon;
  };

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader style={[styles.subheader, { color: colors.text }]}>
          <View style={styles.subheaderContent}>
            {renderIcon()}
            <Text style={styles.subheaderText}>{section.title}</Text>
          </View>
        </List.Subheader>
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  subheader: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    fontSize: 14,
  },
  subheaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subheaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsSection;