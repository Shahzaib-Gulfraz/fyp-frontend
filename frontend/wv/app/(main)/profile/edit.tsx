// app/(main)/profile/edit.tsx
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
  Mail,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Check,
  X,
  User,
  Briefcase,
  Heart,
} from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  
  // Initial user data
  const [userData, setUserData] = useState({
    username: "alexjohnson",
    name: "Alex Johnson",
    bio: "Fashion enthusiast • Virtual try-on expert • Always shopping for the perfect fit 👗",
    email: "alex@wearvirtually.com",
    location: "New York, USA",
    website: "https://alexjohnson.com",
    instagram: "@alexjohnson",
    twitter: "@alexj",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [originalData, setOriginalData] = useState({ ...userData });

  // Ref to track initial load
  const initialLoad = useRef(true);

  // Check for changes
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    
    const hasChanged = 
      userData.username !== originalData.username ||
      userData.name !== originalData.name ||
      userData.bio !== originalData.bio ||
      userData.email !== originalData.email ||
      userData.location !== originalData.location ||
      userData.website !== originalData.website ||
      userData.instagram !== originalData.instagram ||
      userData.twitter !== originalData.twitter;
    
    setChangesMade(hasChanged);
  }, [userData]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!userData.username.trim()) {
      Alert.alert("Error", "Username is required");
      return false;
    }
    if (!userData.email.trim() || !userData.email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  // Save profile changes
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update original data
      setOriginalData({ ...userData });
      setChangesMade(false);
      
      Alert.alert(
        "Success",
        "Profile updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Discard changes and go back to profile
  const handleDiscard = () => {
    if (changesMade) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard all changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setUserData({ ...originalData });
              setChangesMade(false);
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  // Handle X button press - go back to profile
  const handleXPress = () => {
    handleDiscard();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleXPress}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!changesMade || isLoading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!changesMade || isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
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

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Text style={styles.required}>* </Text>
                Username
              </Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Text style={styles.required}>* </Text>
                Name
              </Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={userData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={styles.charCount}>
                  {userData.bio.length}/200
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                  placeholder="Enter your location"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                <Text style={styles.required}>* </Text>
                Email
              </Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Social Links Section */}
            <Text style={styles.sectionTitle}>Social Links</Text>

            {/* Website */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Website</Text>
              <View style={styles.inputContainer}>
                <Globe size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.website}
                  onChangeText={(text) => handleInputChange('website', text)}
                  placeholder="https://example.com"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Instagram */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instagram</Text>
              <View style={styles.inputContainer}>
                <Instagram size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.instagram}
                  onChangeText={(text) => handleInputChange('instagram', text)}
                  placeholder="@username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Twitter/X */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Twitter/X</Text>
              <View style={styles.inputContainer}>
                <Twitter size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.twitter}
                  onChangeText={(text) => handleInputChange('twitter', text)}
                  placeholder="@username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Additional Info Section */}
            <Text style={styles.sectionTitle}>Additional Information</Text>

            {/* Occupation */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Occupation</Text>
              <View style={styles.inputContainer}>
                <Briefcase size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="What do you do?"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Interests */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Interests</Text>
              <View style={styles.inputContainer}>
                <Heart size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your interests (comma separated)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Bottom Save Button */}
            {changesMade && (
              <TouchableOpacity
                style={styles.bottomSaveButton}
                onPress={handleSave}
                disabled={isLoading}
              >
                <View style={styles.bottomSaveContent}>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.bottomSaveText}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
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
    saveButton: {
      backgroundColor: "#00BCD4",
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    saveButtonDisabled: {
      backgroundColor: "#CCCCCC",
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    formContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    required: {
      color: "#FF6B6B",
    },
    inputContainer: {
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
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
    },
    textAreaContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      position: "relative",
    },
    textArea: {
      fontSize: 16,
      color: colors.text,
      minHeight: 100,
    },
    charCount: {
      position: "absolute",
      bottom: 8,
      right: 12,
      fontSize: 12,
      color: "#999",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginTop: 10,
      marginBottom: 20,
    },
    bottomSaveButton: {
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      marginTop: 30,
      marginBottom: 20,
    },
    bottomSaveContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    bottomSaveText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });