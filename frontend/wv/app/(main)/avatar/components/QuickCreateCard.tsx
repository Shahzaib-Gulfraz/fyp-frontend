import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Button } from 'react-native-paper';
import { Sliders } from 'lucide-react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface QuickCreateCardProps {
  onManualSetup: () => void;
}

const QuickCreateCard: React.FC<QuickCreateCardProps> = ({ onManualSetup }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInDown.duration(600).delay(600)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Quick Create</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Create avatar manually without scanning
      </Text>
      <Button
        mode="outlined"
        onPress={onManualSetup}
        style={[styles.button, { borderColor: colors.primary }]}
        icon={() => <Sliders size={20} color={colors.primary} />}
        labelStyle={[styles.buttonText, { color: colors.primary }]}
      >
        Manual Setup
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default QuickCreateCard;