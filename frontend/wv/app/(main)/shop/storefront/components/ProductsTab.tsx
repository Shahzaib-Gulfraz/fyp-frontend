// ProductsTab.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Tag, Package, Shield } from 'lucide-react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface ProductsTabProps {
    theme: any;
    storefrontData: any;
    onInputChange: (field: string, value: any) => void;
}

export const ProductsTab = ({ theme, storefrontData, onInputChange }: ProductsTabProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <View style={styles.tabContent}>
            <View style={styles.toggleGroup}>
                {/* Show Prices */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                        <Tag size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Show Prices</Text>
                            <Text style={styles.toggleDescription}>
                                Display product prices
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.showPrices}
                        onValueChange={(value) => onInputChange('showPrices', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.showPrices ? colors.primary : colors.surface}
                        ios_backgroundColor={colors.surfaceVariant}
                    />
                </View>

                {/* Show Stock Status */}
                <View style={[styles.toggleRow, styles.toggleRowBorder]}>
                    <View style={styles.toggleInfo}>
                        <Package size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Show Stock Status</Text>
                            <Text style={styles.toggleDescription}>
                                Display available stock
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.showStock}
                        onValueChange={(value) => onInputChange('showStock', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.showStock ? colors.primary : colors.surface}
                        ios_backgroundColor={colors.surfaceVariant}
                    />
                </View>

                {/* Enable Wishlist */}
                <View style={[styles.toggleRow, styles.toggleRowBorder]}>
                    <View style={styles.toggleInfo}>
                        <Shield size={20} color={colors.textSecondary} />
                        <View style={styles.toggleTexts}>
                            <Text style={styles.toggleTitle}>Enable Wishlist</Text>
                            <Text style={styles.toggleDescription}>
                                Allow customers to save favorites
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={storefrontData.enableWishlist}
                        onValueChange={(value) => onInputChange('enableWishlist', value)}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                        thumbColor={storefrontData.enableWishlist ? colors.primary : colors.surface}
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