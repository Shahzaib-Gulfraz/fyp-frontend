import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Button } from 'react-native-paper';
import { Scan } from 'lucide-react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import MeasurementSlider from './MeasurementSlider';
import { MEASUREMENT_SLIDERS } from '../constants/mockData';

interface BodyMeasurementsProps {
  measurements: any;
  onUpdateMeasurement: (key: string, value: number) => void;
  onRescan: () => void;
}

const BodyMeasurements: React.FC<BodyMeasurementsProps> = ({
  measurements,
  onUpdateMeasurement,
  onRescan,
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInRight.duration(600).delay(400)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Body Measurements</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Adjust for perfect fit</Text>
        </View>
        <Button
          mode="outlined"
          onPress={onRescan}
          style={[styles.rescanButton, { borderColor: colors.border }]}
          icon={() => <Scan size={16} color={colors.primary} />}
          labelStyle={[styles.rescanText, { color: colors.primary }]}
        >
          Rescan
        </Button>
      </View>

      <View style={[styles.grid, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MEASUREMENT_SLIDERS.map((slider) => (
          <MeasurementSlider
            key={slider.key}
            measurement={measurements}
            slider={slider}
            onUpdate={onUpdateMeasurement}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  subtitle: {
    fontSize: 14,
  },
  rescanButton: {
    borderRadius: 8,
  },
  rescanText: {
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
});

export default BodyMeasurements;