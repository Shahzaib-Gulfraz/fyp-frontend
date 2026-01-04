// app/(main)/home/components/QuickActions.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Camera, ShoppingCart, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from '../styles';



interface QuickAction {
  id: number;
  icon: any;
  label: string;
  color: string;
  route: string;
  animValue: Animated.Value;
}

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const tryOnAnim = useRef(new Animated.Value(0)).current;
  const shopAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateIcons = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tryOnAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(tryOnAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(shopAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shopAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(avatarAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(avatarAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateIcons();
  }, [avatarAnim, shopAnim, tryOnAnim]);

  const getIconAnimation = (animValue: Animated.Value) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.2, 1],
        }),
      },
    ],
  });

  const quickActions: QuickAction[] = [
    {
      id: 1,
      icon: Camera,
      label: "Try On",
      color: colors.primary,
      route: "/try-on",
      animValue: tryOnAnim,
    },
    {
      id: 2,
      icon: ShoppingCart,
      label: "Shop Now",
      color: "#FF6B8B",
      route: "/search",
      animValue: shopAnim,
    },
    {
      id: 3,
      icon: User,
      label: "Avatar",
      color: "#9C27B0",
      route: "/avatar",
      animValue: avatarAnim,
    },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          const animation = getIconAnimation(action.animValue);

          return (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickAction, { backgroundColor: action.color }]}
              onPress={() => router.push(action.route)}
            >
              <Animated.View
                style={[styles.actionIconContainer, animation]}
              >
                <Icon size={24} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};