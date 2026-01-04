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
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import Toast from "react-native-toast-message";
import { authTheme } from "@/src/theme/authTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Password reset requested for:", email);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      Toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "Password reset instructions have been sent to your email.",
      });

      setIsSubmitted(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    router.push("/login");
  };

  const handleResendEmail = () => {
    handleResetPassword();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePreviousStep}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={authTheme.colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <Image
            source={require("../../assets/images/logo-light.png")}
            style={styles.logoRight}
            contentFit="contain"
          />
        </View>


        <View style={styles.content}>
          {!isSubmitted ? (
            <>
              {/* Title Section */}
              <View style={styles.brandContainer}>
                <View style={styles.shineWrapper}>
                  <Text style={styles.appName}>Reset Password</Text>
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
                  Enter your email address and we will send you instructions to
                  reset your password.
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <View style={styles.field}>
                  <Text style={styles.label}>Email Address</Text>
                  <View
                    style={[styles.inputBox, emailError && styles.errorBorder]}
                  >
                    <Ionicons name="mail-outline" size={20} color="#777" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={authTheme.colors.textSecondary}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setEmailError("");
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.error}>{emailError}</Text>
                  ) : null}
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#000", "#333"]}
                    style={styles.buttonInner}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        color={authTheme.colors.buttonText}
                        size="small"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="send-outline"
                          size={20}
                          color={authTheme.colors.buttonText}
                        />
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => router.replace("/(auth)/login")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={authTheme.colors.textSecondary}
                  />
                  <Text style={styles.backToLoginText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successSection}>
                <View style={styles.brandContainer}>
                  <View style={styles.shineWrapper}>
                    <Text style={styles.appName}>Check Your Email</Text>
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
                </View>

                <View style={styles.successContent}>
                  <View style={styles.successIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={80}
                      color={authTheme.colors.primary || "#00BCD4"}
                    />
                  </View>

                  <Text style={styles.successMessage}>
                    We have sent password reset instructions to{"\n"}
                    <Text style={styles.emailHighlight}>{email}</Text>
                  </Text>
                  <Text style={styles.instructions}>
                    Please check your inbox and follow the link to reset your
                    password. The link will expire in 1 hour.
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendEmail}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={["#F8F9FA", "#F8F9FA"]}
                        style={styles.resendButtonInner}
                      >
                        {isLoading ? (
                          <ActivityIndicator
                            color={authTheme.colors.textPrimary}
                            size="small"
                          />
                        ) : (
                          <Text style={styles.resendButtonText}>
                            Resend Email
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backButtonSuccess}
                      onPress={() => router.replace("/(auth)/login")}
                    >
                      <LinearGradient
                        colors={["#000", "#333"]}
                        style={styles.buttonInner}
                      >
                        <Text style={styles.buttonText}>Back to Sign In</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: authTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoRight: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    minHeight: SCREEN_HEIGHT * 0.8,
  },
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
    fontSize: authTheme.fontSizes.subtitle,
    color: authTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
  formContainer: { marginTop: 20 },
  field: { marginBottom: 24 },
  label: {
    fontFamily: authTheme.fonts.semiBold,
    fontSize: authTheme.fontSizes.label,
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
  errorBorder: { borderColor: authTheme.colors.error },
  input: {
    flex: 1,
    fontFamily: authTheme.fonts.regular,
    fontSize: authTheme.fontSizes.input,
    color: authTheme.colors.textPrimary,
  },
  error: {
    color: authTheme.colors.error,
    marginTop: 6,
    fontSize: authTheme.fontSizes.error,
    fontFamily: authTheme.fonts.regular,
  },
  button: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  buttonText: {
    color: authTheme.colors.buttonText,
    fontFamily: authTheme.fonts.semiBold,
    fontSize: authTheme.fontSizes.button,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: authTheme.fontSizes.small || 14,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginLeft: 8,
  },
  successSection: {
    flex: 1,
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    width: "100%",
  },
  successIcon: {
    marginBottom: 32,
  },
  successMessage: {
    fontSize: authTheme.fontSizes.input || 16,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  emailHighlight: {
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
  },
  instructions: {
    fontSize: authTheme.fontSizes.small || 14,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  actionButtons: {
    width: "100%",
    gap: 16,
  },
  resendButton: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
  },
  resendButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius,
  },
  resendButtonText: {
    fontSize: authTheme.fontSizes.button,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
  },
  backButtonSuccess: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
  },
});
