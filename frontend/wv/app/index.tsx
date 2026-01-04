import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";

export default function PreSplash() {
  const router = useRouter();
  const { isDark, themeReady } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animations = useRef<Animated.CompositeAnimation[]>([]);

  // 🔹 Decide theme for PreSplash
  const shouldUseDarkTheme = isAuthenticated && isDark;

  const preSplashTheme = useMemo(
    () => ({
      backgroundColor: shouldUseDarkTheme ? "#121212" : "#ffffff",
      onBackground: shouldUseDarkTheme ? "#ffffff" : "#000000",
    }),
    [shouldUseDarkTheme]
  );

  const logoSource = shouldUseDarkTheme
    ? require("../assets/images/logo-dark.png")
    : require("../assets/images/logo-light.png");

  useEffect(() => {
    if (!themeReady || isLoading) return;

    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

    animations.current = [
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ];

    animations.current.forEach(anim => anim.start());

    const timer = setTimeout(() => {
      router.replace("/splash");
    }, 2000);

    return () => {
      clearTimeout(timer);
      animations.current.forEach(anim => anim.stop());
    };
  }, [themeReady, isLoading, router, dot1, dot2, dot3]);

  // 🔹 While loading auth/theme
  if (!themeReady || isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#121212" : "#ffffff" },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: preSplashTheme.backgroundColor },
      ]}
    >
      <Image
        source={logoSource}
        style={[styles.logo, { backgroundColor: 'transparent' }]}
        resizeMode="contain"
      />


      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot1, backgroundColor: preSplashTheme.onBackground },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot2, backgroundColor: preSplashTheme.onBackground },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot3, backgroundColor: preSplashTheme.onBackground },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 40,
    borderRadius: 16, // optional for smooth corners
    overflow: "hidden", // ensures no sharp edges show
    backgroundColor: "transparent", // removes any visible background
  },
  dotsContainer: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
});

