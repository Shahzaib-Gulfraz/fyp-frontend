import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Settings, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ProfileHeaderProps {
    theme: any;
    toggleTheme: () => void;
    isDark: boolean;
    username: string;
}

export const ProfileHeader = ({ theme, toggleTheme, isDark, username }: ProfileHeaderProps) => {
    const router = useRouter();
    const styles = getStyles(theme.colors);

    return (
        <View style={styles.topHeader}>
            <View style={styles.headerContent}>
                <View style={[styles.usernameContainer, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.usernameStylish}>{username}</Text>
                </View>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                        {isDark ? (
                            <Sun size={22} color={theme.colors.text} />
                        ) : (
                            <Moon size={22} color={theme.colors.text} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push("/(main)/settings")}
                    >
                        <Settings size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        topHeader: {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingTop: 10,
            paddingBottom: 15,
            paddingHorizontal: 20,
        },
        headerContent: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        usernameContainer: {
            flex: 1,
        },
        usernameStylish: {
            fontSize: 22,
            fontFamily: "System",
            color: colors.text,
            letterSpacing: 1,
        },
        headerIcons: {
            flexDirection: "row",
            gap: 15,
        },
        iconButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
        },
    });
