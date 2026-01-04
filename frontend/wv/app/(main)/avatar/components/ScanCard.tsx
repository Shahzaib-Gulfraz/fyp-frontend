import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Button } from 'react-native-paper';
import { Scan, Camera, RefreshCw } from 'lucide-react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';

interface ScanCardProps {
  isScanning: boolean;
  onScanPress: () => void;
}

const ScanCard: React.FC<ScanCardProps> = ({ isScanning, onScanPress }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={SlideInRight.duration(600).delay(400)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.iconContainer}>
        <Scan size={32} color={colors.primary} />
        {isScanning && (
          <View style={styles.scanningDot}>
            <View style={[styles.pulseAnimation, { backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isScanning ? 'Scanning in Progress...' : 'Ready to Scan'}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isScanning
            ? 'Please stand still while we capture your body measurements'
            : 'Create a millimeter-accurate 3D avatar using AR technology'
          }
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={onScanPress}
        disabled={isScanning}
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          isScanning && { backgroundColor: colors.primary + 'AA' }
        ]}
        icon={() => isScanning ? 
          <RefreshCw size={20} color="#FFFFFF" /> : 
          <Camera size={20} color="#FFFFFF" />
        }
        labelStyle={styles.buttonText}
      >
        {isScanning ? 'Scanning...' : 'Start 3D Scan'}
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  scanningDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseAnimation: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.5,
  },
  info: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ScanCard;