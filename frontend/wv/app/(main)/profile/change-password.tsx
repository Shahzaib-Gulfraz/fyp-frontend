// app/(main)/profile/change-password.tsx
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

export default function ChangePasswordScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return false;
    }
    
    if (!formData.newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        "Success",
        "Password changed successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Change Password</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Info Message */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                For security reasons, you'll be asked to log in again after changing your password.
              </Text>
            </View>

            {/* Current Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  value={formData.currentPassword}
                  onChangeText={(text) => handleInputChange('currentPassword', text)}
                  placeholder="Enter current password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#999" />
                  ) : (
                    <Eye size={20} color="#999" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  value={formData.newPassword}
                  onChangeText={(text) => handleInputChange('newPassword', text)}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color="#999" />
                  ) : (
                    <Eye size={20} color="#999" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Must be at least 8 characters long
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#999" />
                  ) : (
                    <Eye size={20} color="#999" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
              <View style={styles.requirementItem}>
                <View style={[
                  styles.requirementDot,
                  formData.newPassword.length >= 8 && styles.requirementDotValid
                ]} />
                <Text style={[
                  styles.requirementText,
                  formData.newPassword.length >= 8 && styles.requirementTextValid
                ]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={[
                  styles.requirementDot,
                  /[A-Z]/.test(formData.newPassword) && styles.requirementDotValid
                ]} />
                <Text style={[
                  styles.requirementText,
                  /[A-Z]/.test(formData.newPassword) && styles.requirementTextValid
                ]}>
                  At least one uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={[
                  styles.requirementDot,
                  /[0-9]/.test(formData.newPassword) && styles.requirementDotValid
                ]} />
                <Text style={[
                  styles.requirementText,
                  /[0-9]/.test(formData.newPassword) && styles.requirementTextValid
                ]}>
                  At least one number
                </Text>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[
                styles.changeButton,
                isLoading && styles.changeButtonDisabled
              ]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.changeButtonText}>Updating...</Text>
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.changeButtonText}>Change Password</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => Alert.alert("Forgot Password", "A password reset link will be sent to your email.")}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    formContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    infoBox: {
      backgroundColor: "#E3F2FD",
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    infoText: {
      fontSize: 14,
      color: "#1565C0",
      lineHeight: 20,
    },
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    passwordInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
    },
    eyeButton: {
      padding: 4,
    },
    passwordHint: {
      fontSize: 12,
      color: "#666",
      marginTop: 6,
      marginLeft: 4,
    },
    requirementsBox: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      marginTop: 8,
      marginBottom: 32,
    },
    requirementsTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    requirementDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#CCC",
      marginRight: 12,
    },
    requirementDotValid: {
      backgroundColor: "#4CAF50",
    },
    requirementText: {
      fontSize: 14,
      color: "#666",
    },
    requirementTextValid: {
      color: "#4CAF50",
    },
    changeButton: {
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    changeButtonDisabled: {
      opacity: 0.7,
    },
    changeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    forgotPasswordButton: {
      alignItems: "center",
      marginTop: 20,
      padding: 10,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#00BCD4",
      fontWeight: "500",
    },
  });