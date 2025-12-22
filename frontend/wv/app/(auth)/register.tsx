import React, { useState } from "react";
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
  Switch,
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
  Inter_700Bold,
} from "@expo-google-fonts/inter";

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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const validateUsername = (username: string) => {
    // Username validation rules
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
    if (
      phone.trim() &&
      !/^[\d\s\-\+\(\)]{10,15}$/.test(phone.replace(/\s/g, ""))
    ) {
      setPhoneError("Please enter a valid phone number");
      isValid = false;
    }

    // Terms agreement check
    if (!agreedToTerms) {
      Alert.alert(
        "Terms Required",
        "You must agree to the Terms of Service and Privacy Policy."
      );
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Import authService dynamically
      const { authService } = await import('../../src/api');

      // Prepare user data
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

      // Call the real API
      const response = await authService.register(userData);

      console.log('Registration successful:', response.user);

      // Verify token was saved
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('Token saved after registration:', !!savedToken);

      // If user is shop owner, redirect to shop registration
      if (userRole === 'shop_owner') {
        Alert.alert(
          "Account Created!",
          "Now let's set up your shop.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(auth)/shop-register"),
            },
          ]
        );
      } else {
        // For regular users, go to login
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(main)/home"),
            },
          ]
        );
      }
    } catch (error: any) {
      // Handle different error types
      if (error.status === 400) {
        // Validation error or duplicate user
        Alert.alert(
          "Registration Failed",
          error.message || "Email or username already exists"
        );
      } else if (error.status === 0) {
        Alert.alert("Network Error", "Please check your internet connection");
      } else {
        Alert.alert(
          "Registration Failed",
          error.message || "An error occurred during registration. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/login")}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Image
              source={{
                uri: "https://raw.githubusercontent.com/example/logo.png",
              }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the future of virtual fashion shopping
            </Text>
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
                  size={24}
                  color={userRole === "user" ? "#FFFFFF" : "#666666"}
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
                onPress={() => {
                  handleRoleSelection("shop_owner");
                  router.push("/shop-register");
                }}
              >
                <Ionicons
                  name="storefront-outline"
                  size={24}
                  color={userRole === "shop_owner" ? "#FFFFFF" : "#666666"}
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

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fullNameError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999999"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameError("");
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
              </View>
              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  emailError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View
                style={[
                  styles.inputWrapper,
                  usernameError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="at-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a unique username"
                  placeholderTextColor="#999999"
                  value={username}
                  onChangeText={(text) => {
                    // Convert to lowercase and remove spaces
                    const formattedText = text
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    setUsername(formattedText);
                    setUsernameError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
              </View>
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
              <Text style={styles.usernameHint}>
                Only letters, numbers, _ and . are allowed
              </Text>
            </View>

            {/* Phone Input (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  phoneError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#999999"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setPhoneError("");
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
              </View>
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              <Text style={styles.passwordHint}>
                Must include uppercase, lowercase, number, and special character
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordError ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#999999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                  selectionColor="rgba(0,0,0,0.1)"
                  {...(Platform.OS === "android" && {
                    underlineColorAndroid: "transparent",
                  })}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsAgreement}>
              <Switch
                value={agreedToTerms}
                onValueChange={setAgreedToTerms}
                trackColor={{ false: "#877c7cff", true: "#000000" }}
                thumbColor={agreedToTerms ? "#FFFFFF" : "#FFFFFF"}
                ios_backgroundColor="#877c7cff"
                style={styles.switch}
              />

              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading ? styles.registerButtonDisabled : null,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#000000", "#333333"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.registerButtonText}>
                      Create Account
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#666666",
    lineHeight: 22,
  },
  roleSection: {
    marginBottom: 25,
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 16,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  roleButtonText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  formSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    height: "100%",
    ...Platform.select({
      ios: {
        backgroundColor: "transparent",
      },
      android: {
        backgroundColor: "transparent",
      },
    }),
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
  usernameHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    marginTop: 4,
    marginLeft: 4,
  },
  passwordHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    marginTop: 4,
    marginLeft: 4,
  },
  termsAgreement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  switch: {
    transform: Platform.OS === "ios" ? [{ scale: 0.8 }] : [],
    marginRight: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666666",
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
  },
  registerButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
});
