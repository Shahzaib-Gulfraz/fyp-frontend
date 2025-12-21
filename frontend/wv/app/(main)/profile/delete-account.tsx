// app/(main)/profile/delete-account.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

export default function DeleteAccountScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);

  const deletionReasons = [
    "I found a better alternative",
    "Privacy concerns",
    "Too many notifications",
    "Not using the app anymore",
    "Technical issues",
    "Other reason",
  ];

  const toggleReason = (reason: string) => {
    if (reasons.includes(reason)) {
      setReasons(reasons.filter(r => r !== reason));
    } else {
      setReasons([...reasons, reason]);
    }
  };

  const validateForm = () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return false;
    }
    
    if (confirmationText.toLowerCase() !== "delete my account") {
      Alert.alert("Error", "Please type 'delete my account' to confirm");
      return false;
    }
    
    if (reasons.length === 0) {
      Alert.alert("Error", "Please select at least one reason");
      return false;
    }
    
    return true;
  };

  const handleDeleteAccount = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted. We're sorry to see you go!",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showFinalWarning = () => {
    Alert.alert(
      "⚠️ Final Warning",
      "This action is PERMANENT and cannot be undone:\n\n" +
      "• All your data will be deleted\n" +
      "• All posts and photos will be removed\n" +
      "• All subscriptions will be cancelled\n" +
      "• You will lose access to all features\n\n" +
      "Are you absolutely sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Anyway",
          style: "destructive",
          onPress: handleDeleteAccount
        }
      ]
    );
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
          
          <Text style={styles.headerTitle}>Delete Account</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={24} color="#D32F2F" />
          <Text style={styles.warningTitle}>Irreversible Action</Text>
          <Text style={styles.warningText}>
            Deleting your account is permanent and cannot be undone. All your data will be lost.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Password Verification */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              <Lock size={16} color="#FF6B6B" /> Confirm Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Reasons for Leaving */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Reason for leaving (optional)</Text>
            <Text style={styles.reasonSubtitle}>
              This helps us improve our service
            </Text>
            <View style={styles.reasonsContainer}>
              {deletionReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    reasons.includes(reason) && styles.reasonButtonSelected
                  ]}
                  onPress={() => toggleReason(reason)}
                >
                  <View style={[
                    styles.reasonCheckbox,
                    reasons.includes(reason) && styles.reasonCheckboxSelected
                  ]}>
                    {reasons.includes(reason) && (
                      <View style={styles.checkmark} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    reasons.includes(reason) && styles.reasonTextSelected
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Final Confirmation */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              Type "delete my account" to confirm
            </Text>
            <TextInput
              style={[
                styles.confirmationInput,
                confirmationText.toLowerCase() === "delete my account" && styles.confirmationInputValid
              ]}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="delete my account"
              placeholderTextColor="#999"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              (isLoading || confirmationText.toLowerCase() !== "delete my account" || !password) && styles.deleteButtonDisabled
            ]}
            onPress={showFinalWarning}
            disabled={isLoading || confirmationText.toLowerCase() !== "delete my account" || !password}
          >
            {isLoading ? (
              <Text style={styles.deleteButtonText}>Deleting...</Text>
            ) : (
              <>
                <Trash2 size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Permanently Delete Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    warningBanner: {
      backgroundColor: "#FFEBEE",
      padding: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#FFCDD2",
    },
    warningTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#D32F2F",
      marginTop: 10,
      marginBottom: 8,
    },
    warningText: {
      fontSize: 14,
      color: "#D32F2F",
      textAlign: "center",
      lineHeight: 20,
    },
    formContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    reasonSubtitle: {
      fontSize: 12,
      color: "#666",
      marginBottom: 12,
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
    reasonsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    reasonButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
      minWidth: "48%",
    },
    reasonButtonSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    reasonCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#CCC",
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    reasonCheckboxSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#00BCD4",
    },
    checkmark: {
      width: 10,
      height: 10,
      backgroundColor: "#FFF",
      borderRadius: 2,
    },
    reasonText: {
      fontSize: 14,
      color: colors.text,
    },
    reasonTextSelected: {
      color: "#00BCD4",
      fontWeight: "500",
    },
    confirmationInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    confirmationInputValid: {
      borderColor: "#4CAF50",
      backgroundColor: "#F1F8E9",
    },
    deleteButton: {
      backgroundColor: "#D32F2F",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    cancelButton: {
      alignItems: "center",
      marginTop: 16,
      padding: 12,
    },
    cancelButtonText: {
      fontSize: 16,
      color: "#00BCD4",
      fontWeight: "500",
    },
  });