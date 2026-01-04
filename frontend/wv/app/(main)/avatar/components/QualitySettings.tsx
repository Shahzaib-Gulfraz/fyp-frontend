import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Chip } from 'react-native-paper';
import { Check } from 'lucide-react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { QUALITY_OPTIONS } from '../constants/mockData';

const { width } = Dimensions.get('window');

interface QualitySettingsProps {
  avatarQuality: string;
  onSelectQuality: (qualityId: string) => void;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({ avatarQuality, onSelectQuality }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInDown.duration(600).delay(300)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Avatar Quality</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Higher quality = better visuals, slower rendering
      </Text>

      <View style={styles.qualityGrid}>
        {QUALITY_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            selected={avatarQuality === option.id}
            onPress={() => onSelectQuality(option.id)}
            style={[
              styles.qualityChip,
              { backgroundColor: colors.surface },
              avatarQuality === option.id && {
                borderColor: colors.primary,
              }
            ]}
            textStyle={[
              styles.qualityName,
              { color: colors.text },
              avatarQuality === option.id && { color: colors.primary }
            ]}
            icon={avatarQuality === option.id ? 
              () => <Check size={16} color={colors.primary} /> : 
              undefined
            }
          >
            {option.name}
          </Chip>
        ))}
      </View>

      <View style={styles.descriptions}>
        {QUALITY_OPTIONS.map((option) => (
          <View key={option.id} style={styles.descriptionContainer}>
            <View style={[
              styles.dot,
              { backgroundColor: colors.primary },
              avatarQuality !== option.id && { opacity: 0.3 }
            ]} />
            <Text style={[
              styles.description,
              { color: colors.textSecondary },
              avatarQuality === option.id && { color: colors.text, fontWeight: '600' }
            ]}>
              {option.desc}
            </Text>
          </View>
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
  qualityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qualityChip: {
    width: (width - 80) / 3,
    height: 44,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  descriptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  descriptionContainer: {
    width: (width - 80) / 3,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default QualitySettings;