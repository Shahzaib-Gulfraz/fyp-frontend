import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ActionButtonsProps {
    theme: any;
}

export const ActionButtons = ({ theme }: ActionButtonsProps) => {
    const router = useRouter();
    const styles = getStyles(theme.colors);

    return (
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(main)/profile/edit")}
            >
                <LinearGradient
                    colors={["#00BCD4", "#00ACC1"]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Edit3 size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => Alert.alert("Share", "Profile shared!")}
            >
                <Share2 size={18} color="#00BCD4" />
                <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                    Share Profile
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        actionButtonsContainer: {
            flexDirection: "row",
            gap: 12,
            marginBottom: 25,
            paddingHorizontal: 20,
        },
        actionButton: {
            flex: 1,
            borderRadius: 12,
            overflow: "hidden",
        },
        buttonGradient: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            gap: 8,
        },
        actionButtonText: {
            fontSize: 14,
            fontWeight: "600",
            color: "#FFFFFF",
        },
        shareButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: "#00BCD4",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            gap: 8,
        },
        shareButtonText: {
            color: "#00BCD4",
        },
    });
