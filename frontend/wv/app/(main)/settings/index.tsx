import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Shield,
  Lock,
  Palette,
  Users,
  UserPlus,
  HelpCircle,
  Info,
  Share2,
  Star,
  Bookmark,
  Eye,
  Video,
  Moon,
  Sun,
  Mail,
  Key,
  Trash2,
  LogOut,
  ShoppingBag,
  CreditCard,
  Package,
  MapPin,
  Coffee,
  Layout,
  Link,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { useUser } from "../../../src/context/UserContext";

const SETTINGS_OPTIONS = [
  {
    title: "Account",
    icon: <User size={22} />,
    items: [
      {
        id: "edit_profile",
        title: "Edit Profile",
        description: "Change your profile information",
        icon: <User size={20} />,
        type: "navigation",
        route: "/profile/edit",
      },
      {
        id: "avatar_settings",
        title: "Avatar Settings",
        description: "Manage your 3D avatar",
        icon: <Layout size={20} />,
        type: "navigation",
        route: "/avatar",
      },
      {
        id: "change_password",
        title: "Change Password",
        description: "Update your account password",
        icon: <Key size={20} />,
        type: "navigation",
        route: "/profile/change-password",
      },
      {
        id: "delete_account",
        title: "Delete Account",
        description: "Permanently delete your account",
        icon: <Trash2 size={20} />,
        type: "navigation",
        route: "/profile/delete-account",
      },
    ],
  },
  {
    title: "Privacy & Security",
    icon: <Shield size={22} />,
    items: [
      {
        id: "account_privacy",
        title: "Account Privacy",
        description: "Control who sees your content",
        icon: <Lock size={20} />,
        type: "navigation",
        route: "/profile/privacy",
      },
      {
        id: "blocked_users",
        title: "Blocked Users",
        description: "Manage blocked accounts",
        icon: <XCircle size={20} />,
        type: "navigation",
        route: "/settings/blocked",
      },
      {
        id: "activity_status",
        title: "Activity Status",
        description: "Show when you're active",
        icon: <Eye size={20} />,
        type: "switch",
        value: true,
      },
      {
        id: "read_receipts",
        title: "Read Receipts",
        description: "Let others see when you've read messages",
        icon: <CheckCircle size={20} />,
        type: "switch",
        value: true,
      },
    ],
  },
  {
    title: "Preferences",
    icon: <Palette size={22} />,
    items: [
      {
        id: "theme",
        title: "Theme",
        description: "Light, Dark, or System default",
        icon: <Palette size={20} />,
        type: "navigation",
        route: "/settings/theme",
      },
      {
        id: "auto_play",
        title: "Auto-Play Videos",
        description: "Play videos automatically",
        icon: <Video size={20} />,
        type: "switch",
        value: true,
      },
    ],
  },
  {
    title: "Shopping & Wardrobe",
    icon: <ShoppingBag size={22} />,
    items: [
      {
        id: "saved_items",
        title: "Saved Items",
        description: "View your saved outfits and products",
        icon: <Bookmark size={20} />,
        type: "navigation",
        route: "/saved-items",
      },
      {
        id: "payment_methods",
        title: "Payment Methods",
        description: "Manage your payment options",
        icon: <CreditCard size={20} />,
        type: "navigation",
        route: "/settings/payments",
      },
      {
        id: "order_history",
        title: "Order History",
        description: "View your past purchases",
        icon: <Package size={20} />,
        type: "navigation",
        route: "/orders",
      },
    ],
  },
  {
    title: "Social",
    icon: <Users size={22} />,
    items: [
      {
        id: "follow_suggestions",
        title: "Follow Suggestions",
        description: "People you may know",
        icon: <UserPlus size={20} />,
        type: "navigation",
        route: "social/suggestions",
      },
      {
        id: "invite_friends",
        title: "Invite Friends",
        description: "Invite friends to Wear Virtually",
        icon: <Share2 size={20} />,
        type: "navigate",
        color: "#0095F6",
        route: "social/qr-code",
      },
      {
        id: "qr_code",
        title: "QR Code",
        description: "Your personal QR code",
        icon: <QrCode size={20} />,
        type: "navigation",
        route: "/qr-code",
      },
      {
        id: "link_sharing",
        title: "Link Sharing",
        description: "Share your profile link",
        icon: <Link size={20} />,
        type: "action",
        color: "#0095F6",
      },
    ],
  },
  {
    title: "Support",
    icon: <HelpCircle size={22} />,
    items: [
      {
        id: "help_center",
        title: "Help Center",
        description: "Get help and support",
        icon: <HelpCircle size={20} />,
        type: "navigation",
        route: "support/help",
      },
      {
        id: "report_problem",
        title: "Report a Problem",
        description: "Report issues or bugs",
        icon: <AlertCircle size={20} />,
        type: "navigation",
        route: "support/report",
      },
      {
        id: "contact_us",
        title: "Contact Us",
        description: "Get in touch with our team",
        icon: <Mail size={20} />,
        type: "navigation",
        route: "support/contact",
      },
    ],
  },
  {
    title: "About",
    icon: <Info size={22} />,
    items: [
      {
        id: "about_app",
        title: "About Wear Virtually",
        description: "Version 2.0.1 • Build 2024.12.01",
        icon: <Info size={20} />,
        type: "info",
      },
      {
        id: "rate_app",
        title: "Rate Wear Virtually",
        description: "Leave a review on the App Store",
        icon: <Star size={20} />,
        type: "action",
        color: "#FFB84D",
      },
      {
        id: "share_app",
        title: "Share App",
        description: "Share with friends and family",
        icon: <Share2 size={20} />,
        type: "action",
        color: "#0095F6",
      },
      {
        id: "developer",
        title: "Developer",
        description: "Information about the developer",
        icon: <Coffee size={20} />,
        type: "navigation",
        route: "/developer",
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const [switches, setSwitches] = useState({
    two_factor: false,
    activity_status: true,
    read_receipts: true,
    auto_play: true,
    data_saver: false,
  });

  const handleSwitchToggle = (id: string) => {
    setSwitches(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const handleAction = (item: any) => {
    const showWebAlert = (title: string, message: string) => {
      if (Platform.OS === "web") {
        window.alert(`${title}: ${message}`);
        return true;
      }
      return false;
    };

    switch (item.id) {
      case "invite_friends":
        if (showWebAlert("Invite Friends", "Share your invite link with friends!")) break;
        Alert.alert("Invite Friends", "Share your invite link with friends!");
        break;
      case "link_sharing":
        if (showWebAlert("Link Sharing", "Your profile link has been copied to clipboard!")) break;
        Alert.alert("Link Sharing", "Your profile link has been copied to clipboard!");
        break;
      case "rate_app":
        if (showWebAlert("Rate App", "Redirecting to App Store...")) break;
        Alert.alert("Rate App", "Redirecting to App Store...");
        break;
      case "share_app":
        if (showWebAlert("Share App", "Sharing Wear Virtually with friends!")) break;
        Alert.alert("Share App", "Sharing Wear Virtually with friends!");
        break;
      case "clear_cache":
        if (Platform.OS === "web") {
          if (window.confirm("Are you sure you want to clear cache?")) {
            window.alert("Cache cleared successfully!");
          }
        } else {
          Alert.alert(
            "Clear Cache",
            "Are you sure you want to clear cache?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear",
                style: "destructive",
                onPress: () => {
                  Alert.alert("Success", "Cache cleared successfully!");
                }
              },
            ]
          );
        }
        break;
      case "delete_account":
        if (Platform.OS === "web") {
          if (window.confirm("This action cannot be undone. All your data will be permanently deleted. Are you sure you want to delete your account?")) {
            window.alert("Your account has been scheduled for deletion.");
          }
        } else {
          Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently deleted.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete Account",
                style: "destructive",
                onPress: () => {
                  Alert.alert("Account Deleted", "Your account has been scheduled for deletion.");
                }
              },
            ]
          );
        }
        break;
    }
  };

  // Get logout function from UserContext
  const { logout } = useUser();

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        console.log("Logging out...");
        await logout();

        // Add a small delay to ensure state updates propagate
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 100);
      } catch (error) {
        console.error("Logout failed:", error);
        if (Platform.OS === "web") {
          window.alert("Failed to logout. Please try again.");
        } else {
          Alert.alert("Error", "Failed to logout. Please try again.");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  const renderSettingItem = (item: any) => {
    // Clone the icon element and pass the color prop
    const renderIcon = (color: string) => {
      if (React.isValidElement(item.icon)) {
        return React.cloneElement(item.icon as React.ReactElement<any>, { color });
      }
      return item.icon;
    };

    switch (item.type) {
      case "switch":
        return (
          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => handleSwitchToggle(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.accent + "20" },
              ]}>
                {renderIcon(theme.colors.accent)}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
            <Switch
              value={switches[item.id as keyof typeof switches] || false}
              onValueChange={() => handleSwitchToggle(item.id)}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        );

      case "navigation":
        return (
          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.accent + "20" },
              ]}>
                {renderIcon(theme.colors.accent)}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        );

      case "action":
        return (
          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => handleAction(item)}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIcon,
                { backgroundColor: item.color + "20" },
              ]}>
                {renderIcon(item.color)}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: item.color || theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        );

      case "info":
        return (
          <View
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.settingItemLeft}>
              <View style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.accent + "20" },
              ]}>
                {renderIcon(theme.colors.accent)}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.colors.background }]}
            onPress={toggleTheme}
          >
            {isDark ? (
              <Sun size={20} color={theme.colors.text} />
            ) : (
              <Moon size={20} color={theme.colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Settings Sections */}
        {SETTINGS_OPTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                {React.isValidElement(section.icon)
                  ? React.cloneElement(section.icon as React.ReactElement<any>, { color: theme.colors.accent })
                  : section.icon
                }
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {section.title}
              </Text>
            </View>

            <View style={styles.settingsList}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            Wear Virtually
          </Text>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
            Version 2.0.1 (Build 2024.12.01)
          </Text>
          <Text style={[styles.appCopyright, { color: theme.colors.textTertiary }]}>
            © 2026 Wear Virtually Inc.
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#FF4444" />
          <Text style={[styles.logoutText, { color: "#FF4444" }]}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  profileMember: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  editProfileButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 188, 212, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  premiumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  premiumItem: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    position: "relative",
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  premiumDescription: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
  upgradeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upgradeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  settingsList: {
    backgroundColor: "transparent",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginLeft: 52,
    marginRight: 12,
  },
  appInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  bottomSpacing: {
    height: 40,
  },
});