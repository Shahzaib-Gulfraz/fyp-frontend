import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import Slider from "@react-native-community/slider";
import { Ruler, Scale, User, Maximize2, Minimize2, Sliders } from 'lucide-react-native';

interface MeasurementSliderProps {
  measurement: any;
  slider: {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
  };
  onUpdate: (key: string, value: number) => void;
}

const MeasurementSlider: React.FC<MeasurementSliderProps> = ({ measurement, slider, onUpdate }) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (slider.key) {
      case 'height':
        return <Ruler size={20} color={colors.primary} />;
      case 'chest':
        return <Scale size={20} color={colors.primary} />;
      case 'waist':
        return <Sliders size={20} color={colors.primary} />;
      case 'hips':
        return <User size={20} color={colors.primary} />;
      case 'shoulder':
        return <Maximize2 size={20} color={colors.primary} />;
      case 'inseam':
        return <Minimize2 size={20} color={colors.primary} />;
      default:
        return <Ruler size={20} color={colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {getIcon()}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{slider.label}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {measurement[slider.key]}{slider.unit}
        </Text>
      </View>

      <Slider
        value={measurement[slider.key]}
        minimumValue={slider.min}
        maximumValue={slider.max}
        onValueChange={(value) => onUpdate(slider.key, value)}
        style={styles.slider}
        thumbTintColor={colors.primary}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
      />

      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>{slider.min}{slider.unit}</Text>
        <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>{slider.max}{slider.unit}</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface }]}
          onPress={() => onUpdate(slider.key, measurement[slider.key] - 1)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface }]}
          onPress={() => onUpdate(slider.key, measurement[slider.key] + 1)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  slider: {
    marginBottom: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rangeLabel: {
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default MeasurementSlider;