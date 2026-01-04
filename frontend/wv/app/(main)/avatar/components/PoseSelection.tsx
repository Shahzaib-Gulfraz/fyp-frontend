import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Chip } from 'react-native-paper';
import { Check } from 'lucide-react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { POSES } from '../constants/mockData';

interface PoseSelectionProps {
  selectedPose: string;
  onSelectPose: (poseId: string) => void;
}

const PoseSelection: React.FC<PoseSelectionProps> = ({ selectedPose, onSelectPose }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInRight.duration(600).delay(200)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Select Pose</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Test how clothes fit in different positions
      </Text>

      <View style={styles.posesGrid}>
        {POSES.map((pose) => (
          <Chip
            key={pose.id}
            selected={selectedPose === pose.id}
            onPress={() => onSelectPose(pose.id)}
            style={[
              styles.poseChip,
              { backgroundColor: colors.surface },
              selectedPose === pose.id && {
                backgroundColor: colors.primary + '10',
                borderColor: colors.primary,
              }
            ]}
            textStyle={[
              styles.poseText,
              { color: colors.text },
              selectedPose === pose.id && { color: colors.primary }
            ]}
            icon={selectedPose === pose.id ? 
              () => <Check size={16} color={colors.primary} /> : 
              undefined
            }
          >
            {pose.emoji} {pose.name}
          </Chip>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  posesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  poseChip: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  poseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PoseSelection;