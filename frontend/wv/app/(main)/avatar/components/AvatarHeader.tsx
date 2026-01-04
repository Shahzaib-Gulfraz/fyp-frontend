import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Button } from 'react-native-paper';
import { Save, RotateCw } from 'lucide-react-native';

interface AvatarHeaderProps {
  title: string;
  subtitle: string;
  hasAvatar: boolean;
  onReset?: () => void;
  onSave?: () => void;
}

const AvatarHeader: React.FC<AvatarHeaderProps> = ({
  title,
  subtitle,
  hasAvatar,
  onReset,
  onSave,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.divider }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      
      {hasAvatar && (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onReset}
            style={[styles.button, { borderColor: colors.border }]}
            icon={() => <RotateCw size={20} color={colors.textSecondary} />}
            labelStyle={[styles.buttonText, { color: colors.textSecondary }]}
          >
            Reset
          </Button>
          <Button
            mode="contained"
            onPress={onSave}
            style={[styles.button, { backgroundColor: colors.primary }]}
            icon={() => <Save size={20} color="#FFFFFF" />}
            labelStyle={[styles.buttonText, { color: '#FFFFFF' }]}
          >
            Save
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AvatarHeader;