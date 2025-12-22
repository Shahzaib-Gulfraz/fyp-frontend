import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { MontserratAlternates_700Bold } from "@expo-google-fonts/montserrat-alternates";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    MontserratAlternates_700Bold,
  });

  const shineAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    let isMounted = true;

    const startAnimation = () => {
      if (!isMounted) return;

      shineAnim.setValue(-200);
      Animated.timing(shineAnim, {
        toValue: 400,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (isMounted) startAnimation();
        }, 2500);
      });
    };

    startAnimation();
    return () => {
      isMounted = false;
    };
  }, [shineAnim]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Minimum 8 characters");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Import authService dynamically to avoid circular dependencies
      const { authService } = await import('../../src/api');

      // Call the real API
      const response = await authService.login(email, password);

      console.log('Login successful:', response.user);

      // Navigate to home screen
      router.replace("/(main)/home");
    } catch (error: any) {
      // Handle different error types
      if (error.status === 401) {
        Alert.alert("Login Failed", "Invalid email or password");
      } else if (error.status === 0) {
        Alert.alert("Network Error", "Please check your internet connection");
      } else {
        Alert.alert("Login Failed", error.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* 🔹 SCROLLABLE CONTENT */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Image
              source={{ uri: "https://raw.githubusercontent.com/example/logo.png" }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.shineWrapper}>
              <Text style={styles.brandText}>Wearvirtually</Text>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shineOverlay,
                  { transform: [{ translateX: shineAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(255,255,255,0.95)",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shineGradient}
                />
              </Animated.View>
            </View>
            <Text style={styles.subtitle}>
              Your virtual fashion destination
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputBox, emailError && styles.errorBorder]}>
                <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  underlineColorAndroid="transparent" // ✅ remove Android rectangle

                />
              </View>
              {!!emailError && <Text style={styles.error}>{emailError}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                  <Text style={styles.forgot}>Forgot?</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputBox, passwordError && styles.errorBorder]}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={styles.error}>{passwordError}</Text>}
            </View>

            {/* Button */}
            <TouchableOpacity
              disabled={isLoading}
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#000000", "#333333"]}
                style={styles.buttonInner}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 🔹 FIXED FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    minHeight: SCREEN_HEIGHT * 0.9, // Reduced to minimize scrolling
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 58, // Reduced
  },

  backButton: {
    padding: 8,
  },

  logo: {
    width: 40,
    height: 40
  },

  brandContainer: {
    alignItems: "center",
    marginTop: 20, // Reduced from 40
    marginBottom: 30, // Reduced from 48
    paddingHorizontal: 20,
  },

  shineWrapper: {
    position: "relative",
    overflow: "hidden",
    paddingVertical: 2,
    paddingHorizontal: 10,
  },


  brandText: {
    fontSize: 38, // Slightly reduced
    fontFamily: "MontserratAlternates_700Bold",
    letterSpacing: 0.8,
    color: "#1A1A1A",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14, // Slightly reduced
    fontFamily: "Inter_400Regular",
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },

  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 90, // 🔥 thinner = sharper shine
  },


  shineGradient: {
    flex: 1,
    transform: [{ skewX: "-20deg" }],
    width: "100%",
  },

  formContainer: {
    marginTop: 10, // Reduced gap between title and form
    paddingHorizontal: 8,
  },

  field: {
    marginBottom: 20, // Slightly reduced
  },

  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },

  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  forgot: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#666",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    paddingVertical: 8,
    // Remove default highlighting
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        backgroundColor: 'transparent',
      },
    }),
  },

  eyeButton: {
    padding: 4,
  },

  errorBorder: {
    borderColor: "#FF3B30",
  },

  error: {
    marginTop: 6,
    fontSize: 12,
    color: "#FF3B30",
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },

  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  buttonInner: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },

  spacer: {
    height: 10, // Reduced space
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },

  footerText: {
    fontFamily: "Inter_400Regular",
    color: "#666",
  },

  signupButton: {
    marginLeft: 4,
  },

  footerLink: {
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
});