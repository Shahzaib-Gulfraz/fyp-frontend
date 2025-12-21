// app/(main)/shop/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

const shopCategories = [
  { id: "clothes", label: "Clothes", icon: "shirt-outline" },
];

const businessTypes = [
  { id: "individual", label: "Individual Seller" },
  { id: "small_business", label: "Small Business" },
  { id: "brand", label: "Brand/Manufacturer" },
  { id: "reseller", label: "Reseller/Dropshipper" },
];

export default function RegisterShopScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [shopData, setShopData] = useState({
    // Step 1: Basic Information
    shopName: "",
    shopUsername: "",
    shopCategory: "clothes", // Default to clothes
    businessType: "",
    description: "",

    // Step 2: Contact & Location
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",

    // Step 3: Password
    password: "",
    confirmPassword: "",

    // Images
    logo: null as string | null,
    banner: null as string | null,

    // Terms
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const validateUsername = (username: string) => {
    // Username validation rules (same as user registration)
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

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Password must be at least 8 characters";
    } else {
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        return "Password must include uppercase, lowercase, number, and special character";
      }
    }
    return "";
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setShopData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImagePicker = async (type: "logo" | "banner") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [3, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleInputChange(type, result.assets[0].uri);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!shopData.shopName.trim()) {
        newErrors.shopName = "Shop name is required";
      }

      // Validate shop username
      const usernameValidationError = validateUsername(shopData.shopUsername);
      if (usernameValidationError) {
        newErrors.shopUsername = usernameValidationError;
      }

      if (!shopData.businessType) {
        newErrors.businessType = "Please select a business type";
      }
      if (!shopData.logo) {
        newErrors.logo = "Shop logo is required";
      }
    } else if (stepNumber === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!shopData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(shopData.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!shopData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }

      if (!shopData.address.trim()) {
        newErrors.address = "Address is required";
      }

      if (!shopData.city.trim()) {
        newErrors.city = "City is required";
      }

      if (!shopData.country.trim()) {
        newErrors.country = "Country is required";
      }
    } else if (stepNumber === 3) {
      // Password validation
      const passwordValidationError = validatePassword(shopData.password);
      if (passwordValidationError) {
        newErrors.password = passwordValidationError;
      }

      // Confirm password validation
      if (!shopData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (shopData.password !== shopData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!shopData.agreedToTerms) {
        Alert.alert(
          "Terms Required",
          "You must agree to the Terms of Service and Privacy Policy."
        );
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (step === 1) {
      router.push("/login");
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Registration Successful!",
        "Your shop account has been created successfully. Please verify your email.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(main)/shop/dashboard"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              step >= stepNumber && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step >= stepNumber && styles.stepNumberActive,
              ]}
            >
              {stepNumber}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              step >= stepNumber && styles.stepLabelActive,
            ]}
          >
            {stepNumber === 1
              ? "Basic Info"
              : stepNumber === 2
              ? "Contact Details"
              : "Password"}
          </Text>
          {stepNumber < 3 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    if (!fontsLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      );
    }

    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Shop Information</Text>
              <Text style={styles.subtitle}>
                Tell us about your shop to get started
              </Text>
            </View>

            {/* Shop Images */}
            <View style={styles.imageSection}>
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={() => handleImagePicker("logo")}
              >
                {shopData.logo ? (
                  <Ionicons name="checkmark-circle" size={32} color="#00BCD4" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={24} color="#666666" />
                    <Text style={styles.imageUploadText}>Shop Logo</Text>
                    <Text style={styles.imageUploadSubtext}>
                      Square, min 300x300px
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageUpload, styles.bannerUpload]}
                onPress={() => handleImagePicker("banner")}
              >
                {shopData.banner ? (
                  <Ionicons name="checkmark-circle" size={32} color="#00BCD4" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={24} color="#666666" />
                    <Text style={styles.imageUploadText}>Shop Banner</Text>
                    <Text style={styles.imageUploadSubtext}>
                      Wide, min 1200x400px
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}

            {/* Shop Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Name *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.shopName ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.shopName}
                  onChangeText={(text) => handleInputChange("shopName", text)}
                  placeholder="Enter your shop name"
                  placeholderTextColor="#999999"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.shopName && (
                <Text style={styles.errorText}>{errors.shopName}</Text>
              )}
            </View>

            {/* Shop Username */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Username *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.shopUsername ? styles.inputError : null,
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
                  value={shopData.shopUsername}
                  onChangeText={(text) => {
                    // Convert to lowercase and remove spaces
                    const formattedText = text
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    handleInputChange("shopUsername", formattedText);
                  }}
                  placeholder="Choose a unique username"
                  placeholderTextColor="#999999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.shopUsername && (
                <Text style={styles.errorText}>{errors.shopUsername}</Text>
              )}
              <Text style={styles.usernameHint}>
                Only letters, numbers, _ and . are allowed
              </Text>
            </View>

            {/* Category - Fixed to Clothes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {shopCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      styles.categoryButtonSelected, // Always selected since only one category
                    ]}
                    disabled // Disable since only one option
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color="#FFFFFF"
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.categoryTextSelected}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.categoryInfo}>
                All shops are registered under the Clothes category
              </Text>
            </View>

            {/* Business Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Business Type *</Text>
              <View style={styles.businessTypeGrid}>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.businessTypeButton,
                      shopData.businessType === type.id &&
                        styles.businessTypeButtonSelected,
                    ]}
                    onPress={() => handleInputChange("businessType", type.id)}
                  >
                    <Text
                      style={[
                        styles.businessTypeText,
                        shopData.businessType === type.id &&
                          styles.businessTypeTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.businessType && (
                <Text style={styles.errorText}>{errors.businessType}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Description</Text>
              <TextInput
                style={styles.textArea}
                value={shopData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Describe your shop and products..."
                placeholderTextColor="#999999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
                cursorColor="#1A1A1A"
              />
              <Text style={styles.charCount}>
                {shopData.description.length}/500
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Contact Details</Text>
              <Text style={styles.subtitle}>Where customers can reach you</Text>
            </View>

            {/* Contact Information */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Email *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputError : null,
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
                  value={shopData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholder="business@email.com"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phone ? styles.inputError : null,
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
                  value={shopData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#999999"
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Website (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.website}
                  onChangeText={(text) => handleInputChange("website", text)}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor="#999999"
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Business Address *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.address ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#666666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.address}
                  onChangeText={(text) => handleInputChange("address", text)}
                  placeholder="Street address"
                  placeholderTextColor="#999999"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.formLabel}>City *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.city ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={shopData.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    placeholder="City"
                    placeholderTextColor="#999999"
                    editable={!isLoading}
                    cursorColor="#1A1A1A"
                  />
                </View>
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>ZIP Code</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={shopData.zipCode}
                    onChangeText={(text) => handleInputChange("zipCode", text)}
                    placeholder="ZIP Code"
                    placeholderTextColor="#999999"
                    editable={!isLoading}
                    cursorColor="#1A1A1A"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Country *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.country ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={shopData.country}
                  onChangeText={(text) => handleInputChange("country", text)}
                  placeholder="Country"
                  placeholderTextColor="#999999"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
                />
              </View>
              {errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Account Security</Text>
              <Text style={styles.subtitle}>
                Create a secure password for your shop account
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputError : null,
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
                  value={shopData.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  placeholder="Create a strong password"
                  placeholderTextColor="#999999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={styles.passwordHint}>
                Must include uppercase, lowercase, number, and special character
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm Password *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword ? styles.inputError : null,
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
                  value={shopData.confirmPassword}
                  onChangeText={(text) =>
                    handleInputChange("confirmPassword", text)
                  }
                  placeholder="Re-enter your password"
                  placeholderTextColor="#999999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor="#1A1A1A"
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
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms Agreement */}
            <View style={styles.termsAgreement}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  handleInputChange("agreedToTerms", !shopData.agreedToTerms)
                }
              >
                <View
                  style={[
                    styles.checkboxInner,
                    shopData.agreedToTerms && styles.checkboxInnerChecked,
                  ]}
                >
                  {shopData.agreedToTerms && (
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
          </View>
        );

      default:
        return null;
    }
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
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePreviousStep}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Shop Registration</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {renderStepContent()}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleNextStep}
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
                      name={
                        step === 3
                          ? "checkmark-circle-outline"
                          : "arrow-forward-outline"
                      }
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.primaryButtonText}>
                      {step === 3 ? "Complete Registration" : "Continue"}
                    </Text>
                  </>
                )}
              </LinearGradient>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#000000",
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#999999",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#999999",
    marginLeft: 8,
  },
  stepLabelActive: {
    color: "#1A1A1A",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 8,
  },
  stepContent: {
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
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
  imageSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  imageUpload: {
    flex: 1,
    height: 120,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerUpload: {
    flex: 2,
  },
  imageUploadText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
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
  },
  eyeIcon: {
    padding: 4,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryButtonSelected: {
    borderColor: "#000000",
    backgroundColor: "#000000",
  },
  categoryIcon: {
    marginRight: 0,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  categoryInfo: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
    marginTop: 8,
    marginLeft: 4,
    fontStyle: "italic",
  },
  businessTypeGrid: {
    gap: 8,
  },
  businessTypeButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  businessTypeButtonSelected: {
    borderColor: "#000000",
    backgroundColor: "#000000",
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
    textAlign: "center",
  },
  businessTypeTextSelected: {
    color: "#FFFFFF",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    marginTop: 8,
    textAlign: "right",
  },
  rowInputs: {
    flexDirection: "row",
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
    marginBottom: 32,
    marginTop: 8,
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
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInnerChecked: {
    backgroundColor: "#000000",
    borderColor: "#000000",
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
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButtonDisabled: {
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
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
});
