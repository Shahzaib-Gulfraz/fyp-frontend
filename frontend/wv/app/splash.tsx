import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Loading dots animation
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // Clean, simple animation sequence like social apps
    Animated.sequence([
      // Fade in background
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Logo animation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Text animation with slight delay
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loading dots animation sequence
    const createDotAnimation = (dotOpacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ])
      );
    };

    const dot1Anim = createDotAnimation(dot1Opacity, 0);
    const dot2Anim = createDotAnimation(dot2Opacity, 150);
    const dot3Anim = createDotAnimation(dot3Opacity, 300);

    dot1Anim.start();
    dot2Anim.start();
    dot3Anim.start();

    // Navigate after 2 seconds (typical social app timing)
    const timer = setTimeout(() => {
  router.replace("/(auth)/login");
  // Or check authentication status first:
  // const isAuthenticated = false; // Check from AsyncStorage or context
  // router.replace(isAuthenticated ? "/(main)/home" : "/(auth)/login");
}, 2000);

    return () => {
      clearTimeout(timer);
      dot1Anim.stop();
      dot2Anim.stop();
      dot3Anim.stop();
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Clean white background */}
      <Animated.View
        style={[
          styles.background,
          {
            opacity: backgroundOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo - centered like Instagram/Facebook */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={{
              uri: "https://raw.githubusercontent.com/example/wear-virtually/main/assets/logo-black.png", // Black logo
            }}
            style={styles.logo}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>

        {/* App name with subtle animation - like Twitter/Instagram */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>Wear Virtually</Text>
          <Text style={styles.tagline}>Style your world virtually</Text>
        </Animated.View>
      </View>

      {/* Loading dots at the bottom - black color */}
      <View style={styles.bottomDotsContainer}>
        <Animated.View style={[styles.loadingDot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot3Opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    // If you want to force a black tint on a white logo, you can use tintColor
    // tintColor: "#000000",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#666666",
    letterSpacing: 0.2,
    textAlign: "center",
    marginBottom: 32,
  },
  // Loading dots at the bottom
  bottomDotsContainer: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000000", // Black color
    marginHorizontal: 6,
  },
});