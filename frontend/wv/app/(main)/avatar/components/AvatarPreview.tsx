import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Chip } from 'react-native-paper';
import { Zap } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import RotatingHumanBody from './RotatingHumanBody';

interface AvatarPreviewProps {
  is3DView: boolean;
  avatarQuality: string;
  measurements: any;
  onToggleView: () => void;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  is3DView,
  avatarQuality,
  measurements,
  onToggleView,
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>3D Preview</Text>
        <Chip
          onPress={onToggleView}
          style={[styles.viewToggle, { backgroundColor: colors.surface }]}
          icon={() => <Zap size={16} color={colors.primary} />}
          textStyle={[styles.viewToggleText, { color: colors.primary }]}
        >
          {is3DView ? '3D View' : 'AR View'}
        </Chip>
      </View>

      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={[styles.preview, { borderColor: colors.primary + '30' }]}
      >
        <View style={styles.avatarModel}>
          <RotatingHumanBody size={100} />

          <View style={[styles.measurementIndicator, styles.heightIndicator]}>
            <View style={[styles.indicatorLine, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]} />
            <Text style={styles.indicatorText}>{measurements.height}cm</Text>
          </View>

          <View style={[styles.measurementIndicator, styles.chestIndicator]}>
            <View style={[styles.indicatorLine, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]} />
            <Text style={styles.indicatorText}>{measurements.chest}cm</Text>
          </View>

          <View style={[styles.measurementIndicator, styles.waistIndicator]}>
            <View style={[styles.indicatorLine, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]} />
            <Text style={styles.indicatorText}>{measurements.waist}cm</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>98%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Quality</Text>
            <Text style={styles.statValue}>{avatarQuality}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Last Updated</Text>
            <Text style={styles.statValue}>Today</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewToggle: {
    height: 32,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
  },
  avatarModel: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  measurementIndicator: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorLine: {
    width: 40,
    height: 2,
  },
  indicatorText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  heightIndicator: {
    top: 20,
    right: 20,
  },
  chestIndicator: {
    top: '40%',
    left: 20,
  },
  waistIndicator: {
    bottom: 60,
    right: 40,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AvatarPreview;