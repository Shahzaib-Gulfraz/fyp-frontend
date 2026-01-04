// TabNavigation.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { AppThemeColors } from '@/src/theme/appTheme';

interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface TabNavigationProps {
    theme: any;
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const TabNavigation = ({ theme, tabs, activeTab, onTabChange }: TabNavigationProps) => {
    const colors = theme.colors as AppThemeColors;
    const styles = getStyles(colors);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
        >
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tabButton,
                        activeTab === tab.id && styles.activeTabButton
                    ]}
                    onPress={() => onTabChange(tab.id)}
                >
                    {tab.icon}
                    <Text
                        style={[
                            styles.tabLabel,
                            activeTab === tab.id && styles.activeTabLabel
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const getStyles = (colors: AppThemeColors) =>
    StyleSheet.create({
        tabsContainer: {
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        tabsContent: {
            paddingHorizontal: 20,
            paddingVertical: 16,
        },
        tabButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 10,
            gap: 8,
        },
        activeTabButton: {
            backgroundColor: colors.primary + '20',
            borderColor: colors.primary,
        },
        tabLabel: {
            fontSize: 14,
            fontFamily: 'Inter_600SemiBold',
            color: colors.textSecondary,
        },
        activeTabLabel: {
            color: colors.primary,
            fontFamily: 'Inter_700Bold',
        },
    });