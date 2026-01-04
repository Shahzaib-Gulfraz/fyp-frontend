// LayoutTab.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Layout } from 'lucide-react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface LayoutTabProps {
    theme: any;
    storefrontData: any;
    onInputChange: (field: string, value: any) => void;
}

export const LayoutTab = ({ theme, storefrontData, onInputChange }: LayoutTabProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <View style={styles.tabContent}>
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Layout Type</Text>
                <View style={styles.layoutOptions}>
                    {['grid', 'list'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.layoutOption,
                                storefrontData.layoutType === type && styles.layoutOptionSelected
                            ]}
                            onPress={() => onInputChange('layoutType', type)}
                        >
                            <Text style={[
                                styles.layoutOptionText,
                                storefrontData.layoutType === type && styles.layoutOptionTextSelected
                            ]}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Products Per Row (Grid only)</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onInputChange('productsPerRow', Math.max(2, storefrontData.productsPerRow - 1))}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityValue}>{storefrontData.productsPerRow}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onInputChange('productsPerRow', Math.min(5, storefrontData.productsPerRow + 1))}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.toggleGroup}>
                {/* Show Categories */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                        <Layout size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Show Categories</Text>
                            <Text style={styles.toggleDescription}>
                                Display category filters
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.showCategories}
                        onValueChange={(value) => onInputChange('showCategories', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.showCategories ? colors.primary : colors.surface}
                        ios_backgroundColor={colors.surfaceVariant}
                    />
                </View>

                {/* Show Search Bar */}
                <View style={[styles.toggleRow, styles.toggleRowBorder]}>
                    <View style={styles.toggleInfo}>
                        <Layout size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Show Search Bar</Text>
                            <Text style={styles.toggleDescription}>
                                Enable storefront search
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.showSearch}
                        onValueChange={(value) => onInputChange('showSearch', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.showSearch ? colors.primary : colors.surface}
                        ios_backgroundColor={colors.surfaceVariant}
                    />
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
        layoutOptions: {
            flexDirection: 'row',
            gap: 12,
        },
        layoutOption: {
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 20,
            alignItems: 'center',
        },
        layoutOptionSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
        },
        layoutOptionText: {
            fontSize: 14,
            fontFamily: 'Inter_500Medium',
            color: colors.text,
        },
        layoutOptionTextSelected: {
            color: colors.primary,
            fontFamily: 'Inter_600SemiBold',
        },
        quantitySelector: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 8,
            width: 150,
            justifyContent: 'space-between',
        },
        quantityButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        quantityButtonText: {
            fontSize: 20,
            fontFamily: 'Inter_600SemiBold',
            color: colors.text,
        },
        quantityValue: {
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold',
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
        toggleRowBorder: {
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 16,
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
    });