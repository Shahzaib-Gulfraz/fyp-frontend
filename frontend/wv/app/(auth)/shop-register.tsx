// app/(auth)/shop-register.tsx
import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import shopService from "../../src/api/shopService";
import { Image } from "expo-image";
import { authTheme } from "@/src/theme/authTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    shopCategory: "clothes",
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

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Password must be at least 8 characters";
    } else {
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
      const passwordValidationError = validatePassword(shopData.password);
      if (passwordValidationError) {
        newErrors.password = passwordValidationError;
      }

      if (!shopData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (shopData.password !== shopData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!shopData.agreedToTerms) {
        Toast.show({
          type: "error",
          text1: "Terms Required",
          text2: "You must agree to the Terms of Service and Privacy Policy.",
        });
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    console.log("Next step triggered for step:", step);
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        console.log("Proceeding to handleSubmit");
        handleSubmit();
      }
    } else {
      console.log("Validation failed for step:", step, errors);
      if (step === 3) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please correct the errors on the form before proceeding.",
        });
      }
    }
  };



  const handleSubmit = async () => {
    console.log("handleSubmit starting...");
    setIsLoading(true);

    try {
      console.log("Current shopData state:", {
        email: shopData.email,
        shopName: shopData.shopName,
        hasLogo: !!shopData.logo,
        hasBanner: !!shopData.banner,
      });

      const shopDataToSend = {
        shopName: shopData.shopName,
        shopUsername: shopData.shopUsername,
        category: shopData.shopCategory,
        businessType: shopData.businessType,
        description: shopData.description,
        email: shopData.email,
        phone: shopData.phone,
        password: shopData.password,
        website: shopData.website || undefined,
        address: shopData.address,
        city: shopData.city,
        country: shopData.country,
        zipCode: shopData.zipCode || undefined,
      };

      const images = {
        logo: shopData.logo,
        banner: shopData.banner,
      };

      console.log("Registering shop:", shopDataToSend.email);

      const response = await shopService.registerShop(shopDataToSend, images);

      console.log("Shop registered successfully:", response);

      Toast.show({
        type: "success",
        text1: response.message || "Registration Successful!",
        text2: "Redirecting to your dashboard...",
        visibilityTime: 2000,
      });

      setTimeout(() => {
        router.replace("/(main)/shop/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.status === 400) {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2:
            error.message ||
            "Email/Username already exists or validation error",
        });
      } else if (error.status === 0) {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your internet connection",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: error.message || "An error occurred during registration.",
        });
      }
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
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <View style={styles.shineWrapper}>
                <Text style={styles.title}>Shop Information</Text>
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
                  <Ionicons
                    name="checkmark-circle"
                    size={32}
                    color={authTheme.colors.primary}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={24}
                      color={authTheme.colors.textSecondary}
                    />
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
                  <Ionicons
                    name="checkmark-circle"
                    size={32}
                    color={authTheme.colors.primary}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={authTheme.colors.textSecondary}
                    />
                    <Text style={styles.imageUploadText}>Shop Banner</Text>
                    <Text style={styles.imageUploadSubtext}>
                      Wide, min 1200x400px
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {errors.logo && <Text style={styles.error}>{errors.logo}</Text>}

            {/* Shop Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Shop Name *</Text>
              <View
                style={[styles.inputBox, errors.shopName && styles.errorBorder]}
              >
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.shopName}
                  onChangeText={(text) => handleInputChange("shopName", text)}
                  placeholder="Enter your shop name"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.shopName && (
                <Text style={styles.error}>{errors.shopName}</Text>
              )}
            </View>

            {/* Shop Username */}
            <View style={styles.field}>
              <Text style={styles.label}>Shop Username *</Text>
              <View
                style={[
                  styles.inputBox,
                  errors.shopUsername && styles.errorBorder,
                ]}
              >
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.shopUsername}
                  onChangeText={(text) => {
                    const formattedText = text
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    handleInputChange("shopUsername", formattedText);
                  }}
                  placeholder="Choose a unique username"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.shopUsername && (
                <Text style={styles.error}>{errors.shopUsername}</Text>
              )}
              <Text style={styles.hintText}>
                Only letters, numbers, _ and . are allowed
              </Text>
            </View>

            {/* Category - Fixed to Clothes */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {shopCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      styles.categoryButtonSelected,
                    ]}
                    disabled
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.categoryTextSelected}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hintText}>
                All shops are registered under the Clothes category
              </Text>
            </View>

            {/* Business Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Business Type *</Text>
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
                <Text style={styles.error}>{errors.businessType}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Shop Description</Text>
              <TextInput
                style={styles.textArea}
                value={shopData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Describe your shop and products..."
                placeholderTextColor={authTheme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
                cursorColor={authTheme.colors.textPrimary}
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
              <View style={styles.shineWrapper}>
                <Text style={styles.title}>Contact Details</Text>
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
              <Text style={styles.subtitle}>Where customers can reach you</Text>
            </View>

            {/* Contact Information */}
            <View style={styles.field}>
              <Text style={styles.label}>Contact Email *</Text>
              <View
                style={[styles.inputBox, errors.email && styles.errorBorder]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholder="business@email.com"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <View
                style={[styles.inputBox, errors.phone && styles.errorBorder]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  placeholder="+92 300 1234567"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Website (Optional)</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.website}
                  onChangeText={(text) => handleInputChange("website", text)}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.field}>
              <Text style={styles.label}>Business Address *</Text>
              <View
                style={[styles.inputBox, errors.address && styles.errorBorder]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.address}
                  onChangeText={(text) => handleInputChange("address", text)}
                  placeholder="Street address"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.address && (
                <Text style={styles.error}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>City *</Text>
                <View
                  style={[styles.inputBox, errors.city && styles.errorBorder]}
                >
                  <TextInput
                    style={styles.input}
                    value={shopData.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    placeholder="City"
                    placeholderTextColor={authTheme.colors.textSecondary}
                    editable={!isLoading}
                    cursorColor={authTheme.colors.textPrimary}
                  />
                </View>
                {errors.city && <Text style={styles.error}>{errors.city}</Text>}
              </View>

              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>ZIP Code</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={shopData.zipCode}
                    onChangeText={(text) => handleInputChange("zipCode", text)}
                    placeholder="ZIP Code"
                    placeholderTextColor={authTheme.colors.textSecondary}
                    editable={!isLoading}
                    cursorColor={authTheme.colors.textPrimary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Country *</Text>
              <View
                style={[styles.inputBox, errors.country && styles.errorBorder]}
              >
                <TextInput
                  style={styles.input}
                  value={shopData.country}
                  onChangeText={(text) => handleInputChange("country", text)}
                  placeholder="Country"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
              </View>
              {errors.country && (
                <Text style={styles.error}>{errors.country}</Text>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <View style={styles.shineWrapper}>
                <Text style={styles.title}>Account Security</Text>
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
                Create a secure password for your shop account
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <View
                style={[styles.inputBox, errors.password && styles.errorBorder]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  placeholder="Create a strong password"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={authTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
              <Text style={styles.hintText}>
                Must include uppercase, lowercase, number, and special character
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View
                style={[
                  styles.inputBox,
                  errors.confirmPassword && styles.errorBorder,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={authTheme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={shopData.confirmPassword}
                  onChangeText={(text) =>
                    handleInputChange("confirmPassword", text)
                  }
                  placeholder="Re-enter your password"
                  placeholderTextColor={authTheme.colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  cursorColor={authTheme.colors.textPrimary}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={authTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
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

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {renderStepContent()}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleNextStep}
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
                      name={
                        step === 3
                          ? "checkmark-circle-outline"
                          : "arrow-forward-outline"
                      }
                      size={20}
                      color={authTheme.colors.buttonText}
                    />
                    <Text style={styles.buttonText}>
                      {step === 3 ? "Complete Registration" : "Continue"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },

  logo: { width: 40, height: 40 },
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
    backgroundColor: authTheme.colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: authTheme.colors.textPrimary,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textSecondary,
  },
  stepNumberActive: {
    color: authTheme.colors.background,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginLeft: 8,
  },
  stepLabelActive: {
    color: authTheme.colors.textPrimary,
    fontFamily: authTheme.fonts.semiBold,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: authTheme.colors.inputBorder,
    marginHorizontal: 8,
  },
  stepContent: {
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  shineWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 90,
    height: "100%",
  },
  shineGradient: {
    flex: 1,
    transform: [{ skewX: "-20deg" }],
  },
  title: {
    fontSize: authTheme.fontSizes.appName,
    fontFamily: authTheme.fonts.bold,
    color: authTheme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: authTheme.fontSizes.subtitle,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
  imageSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  imageUpload: {
    flex: 1,
    height: 120,
    backgroundColor: authTheme.colors.inputBg,
    borderWidth: 2,
    borderColor: authTheme.colors.inputBorder,
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
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textSecondary,
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 11,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginTop: 2,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: authTheme.fontSizes.label,
    fontFamily: authTheme.fonts.semiBold,
    color: authTheme.colors.textPrimary,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: authTheme.colors.inputBg,
    borderRadius: authTheme.borderRadius,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    paddingHorizontal: 16,
    height: 56,
    gap: 10,
  },
  errorBorder: {
    borderColor: authTheme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: authTheme.fontSizes.input,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textPrimary,
    height: "100%",
  },
  error: {
    color: authTheme.colors.error,
    marginTop: 6,
    fontSize: authTheme.fontSizes.error,
    fontFamily: authTheme.fonts.regular,
  },
  hintText: {
    fontSize: 12,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: authTheme.colors.inputBg,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryButtonSelected: {
    borderColor: authTheme.colors.textPrimary,
    backgroundColor: authTheme.colors.textPrimary,
  },
  categoryTextSelected: {
    color: authTheme.colors.background,
    fontFamily: authTheme.fonts.semiBold,
    fontSize: 14,
  },
  businessTypeGrid: {
    gap: 8,
  },
  businessTypeButton: {
    backgroundColor: authTheme.colors.inputBg,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  businessTypeButtonSelected: {
    borderColor: authTheme.colors.textPrimary,
    backgroundColor: authTheme.colors.textPrimary,
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    textAlign: "center",
  },
  businessTypeTextSelected: {
    color: authTheme.colors.background,
    fontFamily: authTheme.fonts.semiBold,
  },
  textArea: {
    backgroundColor: authTheme.colors.inputBg,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: authTheme.fontSizes.input,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    fontFamily: authTheme.fonts.regular,
    color: authTheme.colors.textSecondary,
    marginTop: 8,
    textAlign: "right",
  },
  rowInputs: {
    flexDirection: "row",
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
  actionButtons: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  button: {
    borderRadius: authTheme.borderRadius,
    overflow: "hidden",
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
});
