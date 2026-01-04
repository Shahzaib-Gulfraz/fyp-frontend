// SEOTab.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface SEOTabProps {
    theme: any;
    storefrontData: any;
    onInputChange: (field: string, value: any) => void;
}

export const SEOTab = ({ theme, storefrontData, onInputChange }: SEOTabProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <View style={styles.tabContent}>
            {/* Meta Title */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Meta Title</Text>
                <TextInput
                    style={styles.input}
                    value={storefrontData.metaTitle}
                    onChangeText={(text) => onInputChange('metaTitle', text)}
                    placeholder="Shop name for search engines"
                    placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.charCount}>
                    {storefrontData.metaTitle.length}/60 characters
                </Text>
            </View>

            {/* Meta Description */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Meta Description</Text>
                <TextInput
                    style={styles.textArea}
                    value={storefrontData.metaDescription}
                    onChangeText={(text) => onInputChange('metaDescription', text)}
                    placeholder="Shop description for search results"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>
                    {storefrontData.metaDescription.length}/160 characters
                </Text>
            </View>

            {/* Social Links */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Social Links</Text>
                <TextInput
                    style={styles.input}
                    value={storefrontData.socialLinks.facebook}
                    onChangeText={(text) =>
                        onInputChange('socialLinks', {
                            ...storefrontData.socialLinks,
                            facebook: text,
                        })
                    }
                    placeholder="Facebook page URL"
                    placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={storefrontData.socialLinks.instagram}
                    onChangeText={(text) =>
                        onInputChange('socialLinks', {
                            ...storefrontData.socialLinks,
                            instagram: text,
                        })
                    }
                    placeholder="Instagram profile URL"
                    placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={storefrontData.socialLinks.twitter}
                    onChangeText={(text) =>
                        onInputChange('socialLinks', {
                            ...storefrontData.socialLinks,
                            twitter: text,
                        })
                    }
                    placeholder="Twitter profile URL"
                    placeholderTextColor={colors.textSecondary}
                />
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
        input: {
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
        textArea: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: colors.text,
            minHeight: 100,
        },
        charCount: {
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: colors.textSecondary,
            marginTop: 4,
            textAlign: 'right',
        },
    });