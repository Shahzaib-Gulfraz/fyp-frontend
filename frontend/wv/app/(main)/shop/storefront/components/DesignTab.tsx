// DesignTab.tsx
import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye } from 'lucide-react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface DesignTabProps {
    theme: any;
    storefrontData: any;
    onInputChange: (field: string, value: any) => void;
}

export const DesignTab = ({ theme, storefrontData, onInputChange }: DesignTabProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <View style={styles.tabContent}>
            {/* Primary Color */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Primary Color</Text>
                <View style={styles.colorPickerContainer}>
                    <View style={[styles.colorPreview, { backgroundColor: storefrontData.primaryColor }]} />
                    <TextInput
                        style={styles.colorInput}
                        value={storefrontData.primaryColor}
                        onChangeText={(text) => onInputChange('primaryColor', text)}
                        placeholder="#00BCD4"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>

            {/* Secondary Color */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Secondary Color</Text>
                <View style={styles.colorPickerContainer}>
                    <View style={[styles.colorPreview, { backgroundColor: storefrontData.secondaryColor }]} />
                    <TextInput
                        style={styles.colorInput}
                        value={storefrontData.secondaryColor}
                        onChangeText={(text) => onInputChange('secondaryColor', text)}
                        placeholder="#FF6B6B"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>

            {/* Banner Toggle */}
            <View style={styles.toggleGroup}>
                <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                        <Eye size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Show Banner</Text>
                            <Text style={styles.toggleDescription}>
                                Display banner image on storefront
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.showBanner}
                        onValueChange={(value) => onInputChange('showBanner', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.showBanner ? colors.primary : colors.surface}
                        ios_backgroundColor={colors.surfaceVariant}
                    />
                </View>
            </View>

            {/* Theme Mode */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Theme Mode</Text>
                <View style={styles.themeOptions}>
                    {['light', 'dark', 'auto'].map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.themeOption,
                                storefrontData.themeMode === mode && styles.themeOptionSelected
                            ]}
                            onPress={() => onInputChange('themeMode', mode)}
                        >
                            <Text style={[
                                styles.themeOptionText,
                                storefrontData.themeMode === mode && styles.themeOptionTextSelected
                            ]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: AppThemeColors) =>
    StyleSheet.create({
        tabContent: {
            paddingHorizontal: 20,
            paddingTop: 24,
        },
        formGroup: {
            marginBottom: 24,
        },
        formLabel: {
            fontSize: 15,
            fontFamily: 'Inter_600SemiBold',
            color: colors.text,
            marginBottom: 12,
        },
        colorPickerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        colorPreview: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
        },
        colorInput: {
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: colors.text,
        },
        toggleGroup: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        toggleInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        toggleTexts: {
            marginLeft: 12,
        },
        toggleTitle: {
            fontSize: 15,
            fontFamily: 'Inter_600SemiBold',
            color: colors.text,
            marginBottom: 2,
        },
        toggleDescription: {
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: colors.textSecondary,
        },
        themeOptions: {
            flexDirection: 'row',
            gap: 8,
        },
        themeOption: {
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
        },
        themeOptionSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
        },
        themeOptionText: {
            fontSize: 14,
            fontFamily: 'Inter_500Medium',
            color: colors.text,
        },
        themeOptionTextSelected: {
            color: colors.primary,
            fontFamily: 'Inter_600SemiBold',
        },
    });