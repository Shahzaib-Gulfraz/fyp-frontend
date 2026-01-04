// ShippingTab.tsx
import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface Method {
    id: string;
    name: string;
    price: number;
    enabled: boolean;
}

interface ShippingTabProps {
    theme: any;
    storefrontData: any;
    onInputChange: (field: string, value: any) => void;
    onShippingMethodToggle: (id: string) => void;
}

export const ShippingTab = ({
    theme,
    storefrontData,
    onInputChange,
    onShippingMethodToggle
}: ShippingTabProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <View style={styles.tabContent}>
            {/* Free Shipping Threshold */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Free Shipping Threshold</Text>
                <View style={styles.priceInput}>
                    <Text style={styles.priceSymbol}>$</Text>
                    <TextInput
                        style={styles.priceInputField}
                        value={storefrontData.freeShippingThreshold.toString()}
                        onChangeText={(text) => onInputChange('freeShippingThreshold', parseFloat(text) || 0)}
                        keyboardType="numeric"
                        placeholder="50"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
                <Text style={styles.inputHint}>
                    Free shipping for orders above this amount
                </Text>
            </View>

            {/* Shipping Methods */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Shipping Methods</Text>
                <View style={styles.shippingMethods}>
                    {storefrontData.shippingMethods.map((method: Method) => (
                        <View key={method.id} style={styles.shippingMethod}>
                            <View style={styles.shippingMethodInfo}>
                                <Text style={styles.shippingMethodName}>{method.name}</Text>
                                <Text style={styles.shippingMethodPrice}>
                                    {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
                                </Text>
                            </View>
                            <Switch
                                value={method.enabled}
                                onValueChange={() => onShippingMethodToggle(method.id)}
                                trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
                                thumbColor={method.enabled ? colors.primary : colors.surface}
                                ios_backgroundColor={colors.surfaceVariant}
                            />
                        </View>
                    ))}
                </View>
            </View>

            {/* Return Policy Days */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Return Policy Days</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onInputChange('returnDays', Math.max(0, storefrontData.returnDays - 1))}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityValue}>{storefrontData.returnDays} days</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onInputChange('returnDays', storefrontData.returnDays + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
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
        priceInput: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
        },
        priceSymbol: {
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold',
            color: colors.textSecondary,
            marginRight: 8,
        },
        priceInputField: {
            flex: 1,
            paddingVertical: 14,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: colors.text,
        },
        inputHint: {
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: colors.textSecondary,
            marginTop: 8,
        },
        shippingMethods: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            overflow: "hidden",
        },
        shippingMethod: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        shippingMethodInfo: {
            flex: 1,
        },
        shippingMethodName: {
            fontSize: 15,
            fontFamily: 'Inter_500Medium',
            color: colors.text,
            marginBottom: 2,
        },
        shippingMethodPrice: {
            fontSize: 13,
            fontFamily: 'Inter_400Regular',
            color: colors.textSecondary,
        },
        quantitySelector: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 8,
            width: 150,
            justifyContent: "space-between",
        },
        quantityButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
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
    });