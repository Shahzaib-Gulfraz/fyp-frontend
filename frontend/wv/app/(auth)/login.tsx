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
import { useAuth } from "@/src/context/AuthContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import Toast from "react-native-toast-message";
// /(auth)/login.tsx or register.tsx
import { authTheme } from "@/src/theme/authTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const shineAnim = useRef(new Animated.Value(-120)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const loop = () => {
      shineAnim.setValue(-120);
      Animated.timing(shineAnim, {
        toValue: 320,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => setTimeout(loop, 2200));
    };
    loop();
  }, [shineAnim]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={authTheme.colors.textPrimary} />
      </View>
    );
  }

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }

    if (!password || password.length < 8) {
      setPasswordError("Minimum 8 characters");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const { authService } = await import("../../src/api");
      const res = await authService.login(email, password);

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome back, ${res.user?.fullName || "User"}!`,
      });

      setAuthenticated(true, "user");
      await new Promise((r) => setTimeout(r, 300));
      router.replace("/(main)/home");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Something went wrong");
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("splash")}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={authTheme.colors.textPrimary}
              />
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/logo-light.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.shineWrapper}>
              <Text style={styles.appName}>Wear Virtually</Text>
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
                    "rgba(255,255,255,0.85)",
                    "transparent",
                  ]}
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
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputBox, emailError && styles.errorBorder]}>
                <Ionicons name="mail-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              {!!emailError && <Text style={styles.error}>{emailError}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[styles.inputBox, passwordError && styles.errorBorder]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link - Updated styling */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forget Password?</Text>
              </TouchableOpacity>

              {!!passwordError && (
                <Text style={styles.error}>{passwordError}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#000", "#333"]}
                style={styles.buttonInner}
              >
                {isLoading ? (
                  <ActivityIndicator color={authTheme.colors.buttonText} />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    minHeight: SCREEN_HEIGHT * 0.9,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  logo: { width: 40, height: 40 },

  brandContainer: {
    alignItems: "center",
    marginBottom: 36,
  },

  appName: {
    fontSize: authTheme.fontSizes.appName,
    fontFamily: authTheme.fonts.bold,
    letterSpacing: -0.6,
    color: authTheme.colors.textPrimary,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
  },

  shineWrapper: { position: "relative", overflow: "hidden" },
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 90,
    height: "100%",
  },
  shineGradient: { flex: 1, transform: [{ skewX: "-20deg" }] },

  formContainer: { marginTop: 10 },
  field: { marginBottom: 20 },

  label: {
    fontFamily: authTheme.fonts.semiBold,
    marginBottom: 8,
    color: authTheme.colors.textPrimary,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: authTheme.colors.inputBg,
    borderRadius: authTheme.borderRadius,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    gap: 10,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 4,
  },

  forgotPasswordText: {
    color: authTheme.colors.textSecondary,
    fontFamily: authTheme.fonts.regular,
    fontSize: authTheme.fontSizes.small || 12,
    textDecorationLine: "none",
  },

  input: {
    flex: 1,
    fontFamily: authTheme.fonts.regular,
    fontSize: authTheme.fontSizes.input,
  },

  errorBorder: { borderColor: authTheme.colors.error },
  error: {
    color: authTheme.colors.error,
    marginTop: 6,
    fontSize: authTheme.fontSizes.error,
  },

  button: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
    marginTop: 10,
  },
  buttonInner: { paddingVertical: 18, alignItems: "center" },
  buttonText: {
    color: authTheme.colors.buttonText,
    fontFamily: authTheme.fonts.semiBold,
    fontSize: authTheme.fontSizes.button,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },

  footerText: { color: authTheme.colors.textSecondary },
  footerLink: {
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
  },
});
