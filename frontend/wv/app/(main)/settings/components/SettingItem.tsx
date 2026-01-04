import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { List, Switch } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';
import { SettingItem as SettingItemType } from '../types';

interface SettingItemProps {
  item: SettingItemType;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchToggle?: (id: string) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  item,
  switchValue,
  onPress,
  onSwitchToggle
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (item.type === 'switch' && onSwitchToggle) {
      onSwitchToggle(item.id);
    } else if (onPress) {
      onPress();
    }
  };

  const renderLeftIcon = () => {
    const iconColor = item.color || colors.primary;

    if (React.isValidElement(item.icon)) {
      return (
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          {React.cloneElement(item.icon as React.ReactElement<any>, { color: iconColor })}
        </View>
      );
    }
    return null;
  };

  const renderRight = () => {
    switch (item.type) {
      case 'switch':
        return (
          <Switch
            value={switchValue || false}
            onValueChange={() => onSwitchToggle?.(item.id)}
            color={colors.primary}
          />
        );
      case 'navigation':
      case 'action':
        return <ChevronRight size={20} color={colors.textTertiary} />;
      case 'info':
        return null;
      default:
        return null;
    }
  };

  return (
    <List.Item
      title={item.title}
      description={item.description}
      titleStyle={[styles.title, { color: item.type === 'action' ? item.color || colors.text : colors.text }]}
      descriptionStyle={[styles.description, { color: colors.textSecondary }]}
      left={() => renderLeftIcon()}
      right={() => renderRight()}
      onPress={handlePress}
      style={styles.item}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
  },
});

export default SettingItem;