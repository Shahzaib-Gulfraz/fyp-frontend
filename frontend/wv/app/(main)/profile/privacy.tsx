// app/(main)/profile/privacy.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Lock,
  Check,
  Eye,
  EyeOff,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

export default function PrivacyScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  
  // Privacy settings state
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Additional privacy toggles (optional)
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowTagging: true,
    showActivityStatus: true,
    allowMessagesFromEveryone: true,
  });

  const handleSave = async () => {
    if (!hasChanges) {
      router.back();
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      
      Alert.alert(
        "Success",
        "Privacy settings updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update privacy settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrivacy = (value: boolean) => {
    if (isPrivateAccount !== value) {
      setIsPrivateAccount(value);
      setHasChanges(true);
      
      // Show confirmation for making account private
      if (value) {
        Alert.alert(
          "Switch to Private Account?",
          "When your account is private:\n\n" +
          "• Only approved followers can see your posts\n" +
          "• Your posts won't appear in public feeds\n" +
          "• Existing followers won't be affected\n" +
          "• New followers need your approval\n\n" +
          "Do you want to continue?",
          [
            { text: "Cancel", onPress: () => {
              setIsPrivateAccount(false);
              setHasChanges(false);
            }},
            { text: "Make Private", onPress: () => {} }
          ]
        );
      }
    }
  };

  const handleToggleSetting = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    setHasChanges(true);
  };

  const PrivacyOption = ({
    icon: Icon,
    title,
    description,
    isSelected,
    onPress,
    type = "public",
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    isSelected: boolean;
    onPress: () => void;
    type?: "public" | "private";
  }) => (
    <TouchableOpacity
      style={[
        styles.privacyOption,
        isSelected && styles.privacyOptionSelected,
        isSelected && type === "private" && styles.privacyOptionSelectedPrivate,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        type === "private" && styles.iconContainerPrivate,
        isSelected && type === "private" && styles.iconContainerSelectedPrivate,
      ]}>
        <Icon 
          size={24} 
          color={isSelected 
            ? type === "private" ? "#FF6B6B" : "#00BCD4"
            : "#666"
          } 
        />
      </View>
      
      <View style={styles.privacyContent}>
        <View style={styles.privacyHeader}>
          <Text style={[
            styles.privacyTitle,
            isSelected && type === "private" && styles.privacyTitleSelectedPrivate,
          ]}>
            {title}
          </Text>
          {isSelected && (
            <View style={[
              styles.selectedBadge,
              type === "private" && styles.selectedBadgePrivate,
            ]}>
              <Check size={14} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <Text style={styles.privacyDescription}>
          {description}
        </Text>
        
        {type === "private" && isSelected && (
          <View style={styles.followerCount}>
            <Users size={14} color="#666" />
            <Text style={styles.followerCountText}>
              1,243 current followers will not be affected
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
          
          <Text style={styles.headerTitle}>Account Privacy</Text>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isLoading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>
                {hasChanges ? "Save" : "Done"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Privacy Notice */}
        <View style={styles.noticeBox}>
          <Shield size={20} color="#00BCD4" />
          <Text style={styles.noticeText}>
            Control who can see your content and interact with you
          </Text>
        </View>

        {/* Main Privacy Toggle */}
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          <Text style={styles.sectionSubtitle}>
            Choose who can see your posts and follow you
          </Text>
          
          <View style={styles.privacyOptions}>
            <PrivacyOption
              icon={Globe}
              title="Public Account"
              description="Anyone can see your posts, follow you, and send messages"
              isSelected={!isPrivateAccount}
              onPress={() => togglePrivacy(false)}
              type="public"
            />
            
            <PrivacyOption
              icon={Lock}
              title="Private Account"
              description="Only approved followers can see your posts and interact"
              isSelected={isPrivateAccount}
              onPress={() => togglePrivacy(true)}
              type="private"
            />
          </View>
          
          {isPrivateAccount && (
            <View style={styles.privateInfoBox}>
              <AlertCircle size={18} color="#FF9800" />
              <View style={styles.privateInfoContent}>
                <Text style={styles.privateInfoTitle}>Private Account Active</Text>
                <Text style={styles.privateInfoText}>
                  New followers must send a request that you can approve or decline.
                  Your existing followers won't be affected.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Additional Privacy Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Eye size={20} color="#666" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Show Online Status</Text>
                <Text style={styles.settingDescription}>
                  Let others see when you are active
                </Text>
              </View>
            </View>
            <Switch
              value={privacySettings.showOnlineStatus}
              onValueChange={() => handleToggleSetting('showOnlineStatus')}
              trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
              thumbColor={privacySettings.showOnlineStatus ? '#00BCD4' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <UserCheck size={20} color="#666" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Allow Tagging</Text>
                <Text style={styles.settingDescription}>
                  Allow others to tag you in posts
                </Text>
              </View>
            </View>
            <Switch
              value={privacySettings.allowTagging}
              onValueChange={() => handleToggleSetting('allowTagging')}
              trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
              thumbColor={privacySettings.allowTagging ? '#00BCD4' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <EyeOff size={20} color="#666" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Hide Activity Status</Text>
                <Text style={styles.settingDescription}>
                  Do not show when you view others profiles
                </Text>
              </View>
            </View>
            <Switch
              value={!privacySettings.showActivityStatus}
              onValueChange={() => handleToggleSetting('showActivityStatus')}
              trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
              thumbColor={!privacySettings.showActivityStatus ? '#00BCD4' : '#FFFFFF'}
            />
          </View>
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
    noticeBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E0F7FA",
      padding: 16,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 12,
      gap: 12,
    },
    noticeText: {
      flex: 1,
      fontSize: 14,
      color: "#006064",
      fontWeight: "500",
    },
    mainSection: {
      paddingHorizontal: 20,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 20,
    },
    privacyOptions: {
      gap: 12,
    },
    privacyOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    privacyOptionSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    privacyOptionSelectedPrivate: {
      borderColor: "#FF6B6B",
      backgroundColor: "#FFEBEE",
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#F5F5F5",
      justifyContent: "center",
      alignItems: "center",
    },
    iconContainerPrivate: {
      backgroundColor: "#FFEBEE",
    },
    iconContainerSelectedPrivate: {
      backgroundColor: "#FFCDD2",
    },
    privacyContent: {
      flex: 1,
    },
    privacyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    privacyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    privacyTitleSelectedPrivate: {
      color: "#D32F2F",
    },
    selectedBadge: {
      backgroundColor: "#00BCD4",
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedBadgePrivate: {
      backgroundColor: "#D32F2F",
    },
    privacyDescription: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
    followerCount: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 6,
    },
    followerCountText: {
      fontSize: 13,
      color: "#666",
    },
    privateInfoBox: {
      flexDirection: "row",
      backgroundColor: "#FFF3E0",
      borderWidth: 1,
      borderColor: "#FFE0B2",
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      gap: 12,
    },
    privateInfoContent: {
      flex: 1,
    },
    privateInfoTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FF9800",
      marginBottom: 4,
    },
    privateInfoText: {
      fontSize: 13,
      color: "#666",
      lineHeight: 18,
    },
    settingsSection: {
      paddingHorizontal: 20,
      marginTop: 32,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 10,
    },
    settingInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    settingTexts: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 13,
      color: "#666",
    },
    
  });