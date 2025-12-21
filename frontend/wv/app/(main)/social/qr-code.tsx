// app/(main)/social/qr-code.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  QrCode,
  Share2,
  Download,
  Copy,
  Camera,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

export default function QRCodeScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);

  const router = useRouter();
  const qrRef = useRef<View>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const userProfile = {
    name: "Alex Johnson",
    username: "@alexjohnson",
    userId: "user_123456",
    profileUrl: "https://wearvirtually.com/@alexjohnson",
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(userProfile.profileUrl);
    Alert.alert('Copied', 'Profile link copied to clipboard!');
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;

    setIsDownloading(true);
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Downloaded', 'QR code saved to your device');
      }
    } catch {
      Alert.alert('Error', 'Failed to save QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleScanQR = () => {
    Alert.alert('Scan QR', 'This would open the camera to scan a QR code');
  };

  const handleShareQR = async () => {
    if (!qrRef.current) return;

    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Share my QR Code',
          mimeType: 'image/png',
        });
      } else {
        await Share.share({
          message: `Check out my profile on Wear Virtually: ${userProfile.profileUrl}`,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to share QR code');
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

          <Text style={styles.headerTitle}>QR Code</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShareQR}
          >
            <Share2 size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View ref={qrRef} style={styles.qrContainer}>
          <LinearGradient
            colors={['#00BCD4', '#0097A7']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.qrCard}>
              <View style={styles.qrPlaceholder}>
                <QrCode size={180} color="#00BCD4" />
                <View style={styles.qrLogo}>
                  <Text style={styles.qrLogoText}>WV</Text>
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <Text style={styles.userUsername}>{userProfile.username}</Text>
                <Text style={styles.userId}>ID: {userProfile.userId}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.scanInstruction}>
                Scan this QR code to follow me on Wear Virtually
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadQR}>
            <Download size={24} color="#00BCD4" />
            <Text style={styles.actionText}>
              {isDownloading ? 'Downloading...' : 'Download'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <Copy size={24} color="#00BCD4" />
            <Text style={styles.actionText}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleScanQR}>
            <Camera size={24} color="#00BCD4" />
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How to use your QR code</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              Let friends scan your QR code to follow you instantly
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              Share your QR code on social media or messaging apps
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              Print it or display it at events and meetups
            </Text>
          </View>
        </View>
      </View>
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
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    content: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
    },
    qrContainer: {
      width: '100%',
      maxWidth: 300,
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    gradientBackground: {
      padding: 3,
      borderRadius: 24,
    },
    qrCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 21,
      padding: 24,
      alignItems: 'center',
    },
    qrPlaceholder: {
      width: 220,
      height: 220,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#F0F0F0',
      marginBottom: 20,
      position: 'relative',
    },
    qrLogo: {
      position: 'absolute',
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#00BCD4',
      justifyContent: 'center',
      alignItems: 'center',
    },
    qrLogoText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: 16,
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1A1A1A',
      marginBottom: 4,
    },
    userUsername: {
      fontSize: 16,
      color: '#666',
      marginBottom: 8,
    },
    userId: {
      fontSize: 14,
      color: '#999',
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: '#F0F0F0',
      marginVertical: 16,
    },
    scanInstruction: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      lineHeight: 20,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 32,
      marginBottom: 24,
    },
    actionButton: {
      alignItems: 'center',
      padding: 12,
    },
    actionText: {
      fontSize: 12,
      color: '#00BCD4',
      marginTop: 8,
      fontWeight: '500',
    },
    infoBox: {
      backgroundColor: '#E0F7FA',
      borderRadius: 16,
      padding: 20,
      width: '100%',
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#006064',
      marginBottom: 12,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    infoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#00BCD4',
      marginTop: 6,
      marginRight: 10,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: '#006064',
      lineHeight: 20,
    },
  });