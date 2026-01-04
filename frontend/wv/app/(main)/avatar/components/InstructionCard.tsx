import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronRight } from 'lucide-react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SCAN_STEPS } from '../constants/mockData';

const InstructionCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInDown.duration(600).delay(200)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Step-by-Step Guide</Text>

      <View style={styles.stepsContainer}>
        {SCAN_STEPS.map((step, index) => (
          <View key={step.step} style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>{step.step}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{step.desc}</Text>
            </View>
            {index < SCAN_STEPS.length - 1 && (
              <ChevronRight size={16} color={colors.border} />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
  },
});

export default InstructionCard;