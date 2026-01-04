import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/src/context/ThemeContext';

interface RotatingHumanBodyProps {
  size?: number;
}

const RotatingHumanBody: React.FC<RotatingHumanBodyProps> = ({ size = 80 }) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.humanBody, { width: size, height: size * 2 }]}>
        <View style={[styles.head, { backgroundColor: colors.primary }]} />
        <View style={[styles.body, { backgroundColor: colors.primary }]} />
        <View style={[styles.leftArm, { backgroundColor: colors.primary }]} />
        <View style={[styles.rightArm, { backgroundColor: colors.primary }]} />
        <View style={[styles.leftLeg, { backgroundColor: colors.primary }]} />
        <View style={[styles.rightLeg, { backgroundColor: colors.primary }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  humanBody: {
    position: 'relative',
  },
  head: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.9,
  },
  body: {
    position: 'absolute',
    top: 40,
    left: 25,
    width: 30,
    height: 60,
    opacity: 0.9,
    borderRadius: 10,
  },
  leftArm: {
    position: 'absolute',
    top: 45,
    left: 5,
    width: 20,
    height: 40,
    opacity: 0.9,
    borderRadius: 8,
  },
  rightArm: {
    position: 'absolute',
    top: 45,
    right: 5,
    width: 20,
    height: 40,
    opacity: 0.9,
    borderRadius: 8,
  },
  leftLeg: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 15,
    height: 60,
    opacity: 0.9,
    borderRadius: 8,
  },
  rightLeg: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 15,
    height: 60,
    opacity: 0.9,
    borderRadius: 8,
  },
});

export default RotatingHumanBody;