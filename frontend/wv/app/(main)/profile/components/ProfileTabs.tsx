import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface ProfileTabsProps {
    theme: any;
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const ProfileTabs = ({ theme, tabs, activeTab, onTabChange }: ProfileTabsProps) => {
    const styles = getStyles(theme.colors);

    return (
        <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tabButton,
                        activeTab === tab.id && styles.activeTabButton,
                    ]}
                    onPress={() => onTabChange(tab.id)}
                >
                    {tab.icon}
                    <Text
                        style={[
                            styles.tabLabel,
                            activeTab === tab.id && styles.activeTabLabel,
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        tabsContainer: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginHorizontal: 20,
            marginBottom: 20,
        },
        tabButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            gap: 8,
            borderBottomWidth: 2,
            borderBottomColor: "transparent",
        },
        activeTabButton: {
            borderBottomColor: "#00BCD4",
        },
        tabLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: "#999999",
        },
        activeTabLabel: {
            color: "#00BCD4",
        },
    });
