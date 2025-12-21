import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Moon, Sun, Smartphone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, ThemeMode } from '../../../src/context/ThemeContext';

export default function ThemeSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme, themeMode, setThemeMode, isDark } = useTheme();
    const { colors } = theme;

    const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
        {
            mode: 'light',
            label: 'Light',
            icon: <Sun size={24} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
        },
        {
            mode: 'dark',
            label: 'Dark',
            icon: <Moon size={24} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
        },
        {
            mode: 'system',
            label: 'System',
            icon: <Smartphone size={24} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>THEME</Text>

                <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
                    {themeOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.mode}
                            style={[
                                styles.option,
                                {
                                    borderBottomColor: colors.divider,
                                    borderBottomWidth: index === themeOptions.length - 1 ? 0 : 1
                                }
                            ]}
                            onPress={() => setThemeMode(option.mode)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                    {option.icon}
                                </View>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                            </View>

                            {themeMode === option.mode && (
                                <View style={[styles.checkContainer, { backgroundColor: colors.primary }]}>
                                    <Check size={16} color={isDark ? '#000' : '#FFF'} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Select your preferred appearance. System setting will automatically adjust based on your device&apos;s display settings.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    optionsContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Inter_500Medium',
    },
    checkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 4,
    },
});
