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
import { authTheme } from "../../src/theme/authTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type UserRole = "user" | "shop_owner";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("user");

  // Error states
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;

    if (!username.trim()) {
      return "Username is required";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (username.length > 20) {
      return "Username cannot exceed 20 characters";
    }

    if (!usernameRegex.test(username)) {
      return "Only letters, numbers, underscore (_), and period (.) are allowed";
    }

    if (username.startsWith(".") || username.startsWith("_")) {
      return "Username cannot start with . or _";
    }

    if (username.endsWith(".") || username.endsWith("_")) {
      return "Username cannot end with . or _";
    }

    if (
      username.includes("..") ||
      username.includes("__") ||
      username.includes("._") ||
      username.includes("_.")
    ) {
      return "Username cannot contain consecutive special characters";
    }

    return "";
  };

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setFullNameError("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPhoneError("");

    // Full Name validation
    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      isValid = false;
    } else if (fullName.trim().split(" ").length < 2) {
      setFullNameError("Please enter your full name");
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    // Username validation
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else {
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        setPasswordError(
          "Password must include uppercase, lowercase, number, and special character"
        );
        isValid = false;
      }
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    // Phone validation (optional but with format check if provided)
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    if (phone.trim() && !phoneRegex.test(phone.trim())) {
      setPhoneError("Invalid format. Example: +92 300 1234567");
      isValid = false;
    }

    // Terms agreement check
    if (!agreedToTerms) {
      Toast.show({
        type: 'error',
        text1: 'Terms Required',
        text2: 'You must agree to the Terms of Service and Privacy Policy.',
      });
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { authService } = await import("../../src/api");

      const userData = {
        fullName,
        email,
        username,
        password,
        phone: phone.trim() || undefined,
        role: userRole,
      };

      console.log("Registration attempt:", {
        fullName,
        email,
        username,
        phone,
        role: userRole,
      });

      const response = await authService.register(userData);

      console.log("Registration successful:", response.user);

      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const savedToken = await AsyncStorage.getItem("authToken");
      console.log("Token saved after registration:", !!savedToken);

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: `Welcome to Wear Virtually, ${fullName}!`,
      });

      if (userRole === "shop_owner") {
        // For shop owners, redirect to shop registration
        setTimeout(() => {
          router.replace("/(auth)/shop-register");
        }, 1000);
      } else {
        // For regular users, go to home
        setTimeout(() => {
          router.replace("/(main)/home");
        }, 1000);
      }
    } catch (error: any) {
      if (error.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.message || 'Email or username already exists',
        });
      } else if (error.status === 0) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Please check your internet connection',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.message || 'An error occurred during registration. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);

    if (role === "shop_owner") {
      router.replace("/(auth)/shop-register");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
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
              <Text style={styles.appName}>Create Account</Text>
              <Animated.View
                pointerEvents="none"
                style={[styles.shineOverlay, { transform: [{ translateX: shineAnim }] }]}
              >
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.85)", "transparent"]}
                  style={styles.shineGradient}
                />
              </Animated.View>
            </View>

            <Text style={styles.subtitle}>Join our fashion community</Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>Register as:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userRole === "user" && styles.roleButtonActive,
                ]}
                onPress={() => handleRoleSelection("user")}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={userRole === "user" ? authTheme.colors.buttonText : authTheme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    userRole === "user" && styles.roleButtonTextActive,
                  ]}
                >
                  User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userRole === "shop_owner" && styles.roleButtonActive,
                ]}
                onPress={() => handleRoleSelection("shop_owner")}
              >
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={userRole === "shop_owner" ? authTheme.colors.buttonText : authTheme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    userRole === "shop_owner" && styles.roleButtonTextActive,
                  ]}
                >
                  Shop Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputBox, fullNameError && styles.errorBorder]}>
                <Ionicons name="person-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameError("");
                  }}
                  autoCapitalize="words"
                />
              </View>
              {!!fullNameError && <Text style={styles.error}>{fullNameError}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputBox, emailError && styles.errorBorder]}>
                <Ionicons name="mail-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {!!emailError && <Text style={styles.error}>{emailError}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <View style={[styles.inputBox, usernameError && styles.errorBorder]}>
                <Ionicons name="at-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a unique username"
                  value={username}
                  onChangeText={(text) => {
                    const formattedText = text.toLowerCase().replace(/\s+/g, "");
                    setUsername(formattedText);
                    setUsernameError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {!!usernameError && <Text style={styles.error}>{usernameError}</Text>}
              <Text style={styles.hintText}>
                Only letters, numbers, _ and . are allowed
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputBox, phoneError && styles.errorBorder]}>
                <Ionicons name="call-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setPhoneError("");
                  }}
                  keyboardType="phone-pad"
                />
              </View>
              {!!phoneError && <Text style={styles.error}>{phoneError}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputBox, passwordError && styles.errorBorder]}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
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
              <Text style={styles.hintText}>
                Must include uppercase, lowercase, number, and special character
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputBox, confirmPasswordError && styles.errorBorder]}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError("");
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {!!confirmPasswordError && <Text style={styles.error}>{confirmPasswordError}</Text>}
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsAgreement}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View
                  style={[
                    styles.checkboxInner,
                    agreedToTerms && styles.checkboxInnerChecked,
                  ]}
                >
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient colors={["#000", "#333"]} style={styles.buttonInner}>
                {isLoading ? (
                  <ActivityIndicator color={authTheme.colors.buttonText} />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerLink}> Sign In</Text>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: authTheme.colors.background,
  },

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
    marginBottom: 20,
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
  },

  shineWrapper: { position: "relative", overflow: "hidden" },
  shineOverlay: { position: "absolute", top: 0, left: 0, width: 90, height: "100%" },
  shineGradient: { flex: 1, transform: [{ skewX: "-20deg" }] },

  roleSection: {
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: authTheme.fontSizes.label,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: authTheme.colors.inputBg,
    borderRadius: authTheme.borderRadius,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: authTheme.colors.textPrimary,
    borderColor: authTheme.colors.textPrimary,
  },
  roleButtonText: {
    fontSize: 14,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textSecondary,
  },
  roleButtonTextActive: {
    color: authTheme.colors.buttonText,
  },

  formContainer: { marginTop: 10 },
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
    height: 56,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    gap: 10,
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

  hintText: {
    fontSize: 12,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginTop: 6,
  },

  termsAgreement: {
    marginBottom: 20,
    marginTop: 10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: authTheme.colors.inputBorder,
    backgroundColor: authTheme.colors.background,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInnerChecked: {
    backgroundColor: authTheme.colors.textPrimary,
    borderColor: authTheme.colors.textPrimary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
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

  footerText: {
    color: authTheme.colors.textSecondary,
    fontSize: authTheme.fontSizes.footer,
  },
  footerLink: {
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
    fontSize: authTheme.fontSizes.footer,
  },
});