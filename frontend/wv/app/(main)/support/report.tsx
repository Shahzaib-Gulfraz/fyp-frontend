// app/(main)/support/report.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Send,
  Bug,
  Smartphone,
  WifiOff,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import * as Device from 'expo-device';

const problemTypes = [
  { id: "bug", label: "App Bug", icon: <Bug size={18} color="#666" /> },
  { id: "performance", label: "Performance", icon: <Smartphone size={18} color="#666" /> },
  { id: "connection", label: "Connection", icon: <WifiOff size={18} color="#666" /> },
  { id: "feature", label: "Feature Request", icon: <AlertCircle size={18} color="#666" /> },
  { id: "other", label: "Other", icon: <AlertCircle size={18} color="#666" /> },
];

export default function ReportProblemScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);

  const router = useRouter();
  const [formData, setFormData] = useState({
    problemType: "",
    title: "",
    description: "",
    email: "",
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map(asset => asset.uri);
      setAttachments(prev => [...prev, ...newAttachments.slice(0, 3 - prev.length)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };


  const validateForm = () => {
    if (!formData.problemType) {
      Alert.alert("Error", "Please select a problem type");
      return false;
    }
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please describe the problem");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        "Report Submitted",
        "Thank you for your feedback! Our team will review your report and get back to you if needed.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
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

          <Text style={styles.headerTitle}>Report a Problem</Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          {/* Problem Type */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>What type of problem are you having?</Text>
            <View style={styles.problemTypesGrid}>
              {problemTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.problemTypeButton,
                    formData.problemType === type.id && styles.problemTypeButtonSelected
                  ]}
                  onPress={() => handleInputChange('problemType', type.id)}
                >
                  {type.icon}
                  <Text style={[
                    styles.problemTypeText,
                    formData.problemType === type.id && styles.problemTypeTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Brief title of the problem</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="e.g., App crashes when uploading photos"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Describe the problem in detail</Text>
            <TextInput
              style={styles.textArea}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Please describe what happened, what you were doing, and any error messages you saw..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.description.length}/1000
            </Text>
          </View>

          {/* Attachments */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Attachments (Optional)</Text>
            <Text style={styles.formSubtitle}>
              Add screenshots or photos to help us understand the problem
            </Text>

            <View style={styles.attachmentsContainer}>
              {attachments.map((uri, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <ImageIcon size={24} color="#00BCD4" />
                  <Text style={styles.attachmentText} numberOfLines={1}>
                    Image {index + 1}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => removeAttachment(index)}
                  >
                    <Text style={styles.removeAttachmentText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {attachments.length < 3 && (
                <TouchableOpacity
                  style={styles.addAttachmentButton}
                  onPress={handleImagePicker}
                >
                  <Upload size={24} color="#00BCD4" />
                  <Text style={styles.addAttachmentText}>Add Attachment</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Email (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email (Optional)</Text>
            <Text style={styles.formSubtitle}>
              If you&apos;d like us to follow up with you
            </Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Device Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Device Information</Text>
            <Text style={styles.infoText}>
              Platform: {Platform.OS} {Platform.Version}
            </Text>
            <Text style={styles.infoText}>
              Device: {Device.modelName || "Unknown"}
            </Text>
            <Text style={styles.infoText}>
              App Version: 1.0.0
            </Text>
            <Text style={styles.infoNote}>
              This information helps us diagnose the problem.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.bottomSubmitButton,
              isSubmitting && styles.bottomSubmitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
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
    submitButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#00BCD4",
      justifyContent: "center",
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.7,
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
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    formSubtitle: {
      fontSize: 12,
      color: "#666",
      marginBottom: 12,
    },
    problemTypesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    problemTypeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    problemTypeButtonSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    problemTypeText: {
      fontSize: 14,
      color: colors.text,
    },
    problemTypeTextSelected: {
      color: "#00BCD4",
      fontWeight: "600",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: "top",
    },
    charCount: {
      fontSize: 12,
      color: "#999",
      marginTop: 8,
      textAlign: "right",
    },
    attachmentsContainer: {
      gap: 8,
    },
    attachmentItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    attachmentText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    removeAttachmentButton: {
      padding: 4,
    },
    removeAttachmentText: {
      fontSize: 20,
      color: "#FF6B6B",
      fontWeight: "bold",
    },
    addAttachmentButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#00BCD4",
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 16,
      gap: 8,
    },
    addAttachmentText: {
      fontSize: 14,
      color: "#00BCD4",
      fontWeight: "500",
    },
    infoBox: {
      backgroundColor: "#E0F7FA",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: "#006064",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: "#006064",
      marginBottom: 4,
    },
    infoNote: {
      fontSize: 12,
      color: "#006064",
      fontStyle: "italic",
      marginTop: 8,
    },
    bottomSubmitButton: {
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    bottomSubmitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });