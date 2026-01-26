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
  ScrollView,
  Alert
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
// Import Services
import authService from "@/src/api/authService";
import shopService from "@/src/api/shopService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // State
  const [loginMode, setLoginMode] = useState<"user" | "shop">("user");
  const [step, setStep] = useState<1 | 2>(1); // 1 = Email, 2 = Reset Form
  
  // Step 1: Email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Step 2: OTP & New Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Animation
  const shineAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    const loop = () => {
      shineAnim.setValue(-120);
      Animated.timing(shineAnim, {
        toValue: 320,
        duration: 2500, // slower shine
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => setTimeout(loop, 2200));
    };
    loop();
  }, [shineAnim]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={authTheme.colors.textPrimary} />
      </View>
    );
  }

  // --- Handlers ---

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

  // Step 1: Send OTP
  const handleSendCode = async () => {
    if (!validateEmail()) return;
    setIsLoading(true);

    try {
        if (loginMode === "user") {
            await authService.forgotPassword(email);
        } else {
            await shopService.forgotPassword(email);
        }

        Toast.show({
            type: "success",
            text1: "Code Sent",
            text2: `A verification code has been sent to ${email}`,
        });
        
        setStep(2); // Move to next step
    } catch (e: any) {
        setEmailError(e.response?.data?.message || e.message || "Failed to send code");
    } finally {
        setIsLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleResetPassword = async () => {
    if (!otp || otp.length < 6) {
        Toast.show({ type: "error", text1: "Invalid Code", text2: "Please enter the 6-digit code" });
        return;
    }
    if (!password || password.length < 8) {
        Toast.show({ type: "error", text1: "Weak Password", text2: "Password must be at least 8 chars" });
        return;
    }
    if (password !== confirmPassword) {
        Toast.show({ type: "error", text1: "Mismatch", text2: "Passwords do not match" });
        return;
    }

    setIsLoading(true);
    try {
        const payload = { email, otp, password };
        
        if (loginMode === "user") {
            await authService.resetPassword(payload);
        } else {
            await shopService.resetPassword(payload);
        }

        Toast.show({
            type: "success",
            text1: "Success",
            text2: "Password reset successfully. Please login.",
        });

        // Redirect to login after slight delay
        setTimeout(() => {
            router.replace("/(auth)/login");
        }, 1500);
        
    } catch (e: any) {
        Toast.show({
            type: "error",
            text1: "Reset Failed",
            text2: e.response?.data?.message || e.message || "Something went wrong",
        });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Renders ---

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Header / Nav */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={authTheme.colors.textPrimary} />
                </TouchableOpacity>
                <Image
                    source={require("../../assets/images/logo-light.png")}
                    style={styles.logo}
                    contentFit="contain"
                />
            </View>

            {/* Title & Branding */}
            <View style={styles.brandContainer}>
                <View style={styles.shineWrapper}>
                    <Text style={styles.appName}>
                        {step === 1 ? "Forgot Password" : "Reset Password"}
                    </Text>
                    {/* Shine Effect */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.shineOverlay,
                            { transform: [{ translateX: shineAnim }] },
                        ]}
                    >
                         <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.85)", "transparent"]}
                            style={styles.shineGradient}
                        />
                    </Animated.View>
                </View>

                <Text style={styles.subtitle}>
                    {step === 1 
                        ? "Enter your email to receive a reset code." 
                        : "Enter the code and your new password."}
                </Text>

                {/* Mode Selector (Only in Step 1) */}
                {step === 1 && (
                    <View style={styles.modeToggleContainer}>
                        <TouchableOpacity
                            onPress={() => setLoginMode("user")}
                            style={[styles.modeButton, loginMode === "user" && styles.modeButtonActive]}
                        >
                            <Ionicons name="person-outline" size={18} color={loginMode === "user" ? "#fff" : "#666"} />
                            <Text style={[styles.modeButtonText, loginMode === "user" && styles.modeButtonTextActive]}>Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setLoginMode("shop")}
                            style={[styles.modeButton, loginMode === "shop" && styles.modeButtonActive]}
                        >
                            <Ionicons name="storefront-outline" size={18} color={loginMode === "shop" ? "#fff" : "#666"} />
                            <Text style={[styles.modeButtonText, loginMode === "shop" && styles.modeButtonTextActive]}>Shop Owner</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.formContainer}>
                
                {/* STEP 1: Email Input */}
                {step === 1 ? (
                    <View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[styles.inputBox, emailError && styles.errorBorder]}>
                                <Ionicons name="mail-outline" size={20} color="#777" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setEmailError(""); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                            {!!emailError && <Text style={styles.error}>{emailError}</Text>}
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSendCode}
                            disabled={isLoading}
                        >
                            <LinearGradient colors={["#000", "#333"]} style={styles.buttonInner}>
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Send Code</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* STEP 2: OTP and Password */
                    <View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Verification Code</Text>
                            <View style={styles.inputBox}>
                                <Ionicons name="key-outline" size={20} color="#777" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputBox}>
                                <Ionicons name="lock-closed-outline" size={20} color="#777" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Minimum 8 characters"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#777" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={styles.field}>
                             <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputBox}>
                                <Ionicons name="lock-closed-outline" size={20} color="#777" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            <LinearGradient colors={["#000", "#333"]} style={styles.buttonInner}>
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Reset Password</Text>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.resendLink} onPress={() => setStep(1)}>
                            <Text style={styles.resendText}>Didn't get the code? Try again</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* Back to Login */}
                 <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace("/(auth)/login")}>
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
        </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoRight: {
    width: 40,
    height: 40,
    resizeMode: "contain",
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
    marginBottom: 8
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
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    width: "100%",
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  formContainer: { marginTop: 20 },
  field: { marginBottom: 20 },
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
    height: 52,
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
  resendLink: {
      alignItems: 'center',
      marginTop: 20
  },
  resendText: {
      color: authTheme.colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14
  },
  backToLogin: {
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 20
  },
  backToLoginText: {
    fontSize: authTheme.fontSizes.small || 14,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
  },
});
