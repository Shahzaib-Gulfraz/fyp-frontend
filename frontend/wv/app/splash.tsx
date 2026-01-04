import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { authTheme } from "../src/theme/authTheme";

export default function SplashScreen() {
  const router = useRouter();
  /* ---------------- Animations ---------------- */
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;

  /* ---------------- Fonts ---------------- */
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  /* ---------------- Force LIGHT Splash ---------------- */
  const bgColor = authTheme.colors.background;
  const textColor = authTheme.colors.textPrimary;
  const subTextColor = authTheme.colors.textSecondary;

  useEffect(() => {
    if (!fontsLoaded) return;

    Animated.sequence([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
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
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fontsLoaded, backgroundOpacity, textOpacity, textTranslateY, buttonsOpacity, buttonsTranslateY]);

  const handleGetStarted = () => router.replace("/(auth)/register");
  const handleLogin = () => router.replace("/(auth)/login");

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style="dark" />

      {/* Background */}
      <Animated.View
        style={[styles.background, { opacity: backgroundOpacity }]}
      >
        <LinearGradient
          colors={[bgColor, bgColor, bgColor]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* -------- TOP TEXT -------- */}
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={[styles.appName, { color: textColor }]}>
              Wear Virtually
            </Text>
            <Text style={[styles.tagline, { color: subTextColor }]}>
              Style your world virtually
            </Text>
          </Animated.View>
        </View>

        {/* -------- ABOUT -------- */}
        <Animated.View style={[styles.aboutSection, { opacity: textOpacity }]}>
          <Text style={[styles.aboutTitle, { color: textColor }]}>
            Try Before You Wear
          </Text>
          <Text style={[styles.aboutText, { color: subTextColor }]}>
            Wear Virtually lets you create a realistic 3D avatar using your
            camera, try outfits in real-time, customize your body shape, and
            explore fashion without guesswork.
          </Text>
        </Animated.View>
      </View>

      {/* -------- BUTTONS -------- */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#000", "#333"]}
            style={styles.getStartedInner}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, { borderColor: textColor }]}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={[styles.loginText, { color: textColor }]}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  gradient: { flex: 1 },

  content: { flex: 1 },

  topSection: {
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: { alignItems: "center" },

  appName: {
    fontSize: authTheme.fontSizes.appName,
    fontFamily: authTheme.fonts.bold,
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: authTheme.fontSizes.input,
    fontFamily: authTheme.fonts.regular,
    textAlign: "center",
  },

  aboutSection: {
    paddingHorizontal: 32,
    marginTop: 32,
  },

  aboutTitle: {
    fontSize: 20,
    fontFamily: authTheme.fonts.semiBold,
    marginBottom: 12,
    textAlign: "center",
  },

  aboutText: {
    fontSize: 15,
    fontFamily: authTheme.fonts.regular,
    lineHeight: 22,
    textAlign: "center",
  },

  buttonsContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    paddingHorizontal: 24,
  },

  getStartedButton: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
    marginBottom: 12,
  },

  getStartedInner: {
    paddingVertical: 16, // match login button height
    alignItems: "center",
    justifyContent: "center", // ensures text is perfectly centered
  },

  getStartedText: {
    fontSize: authTheme.fontSizes.button,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.buttonText,
  },

  loginButton: {
    borderRadius: authTheme.borderRadius,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center", // add this to match text centering
    borderWidth: 1.5,
  },

  loginText: {
    fontSize: authTheme.fontSizes.button,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary, // already applied inline
  },
});
