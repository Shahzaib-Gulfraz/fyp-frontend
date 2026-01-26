import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * EmptyState Component
 * Displays an empty state with icon, message, and optional action
 */
const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, actionLabel, onAction }) => {
    const { colors } = useTheme();
    const { spacing, radius, fonts } = appTheme.tokens;

    return (
        <View style={[styles.container, { paddingVertical: spacing.xl * 2 }]}>
            {Icon && (
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: colors.surface,
                            borderRadius: radius.full,
                            padding: spacing.lg,
                            marginBottom: spacing.lg,
                        },
                    ]}
                >
                    <Icon size={48} color={colors.textTertiary} />
                </View>
            )}

            <Text
                style={[
                    styles.title,
                    {
                        color: colors.text,
                        fontFamily: fonts.semiBold,
                        marginBottom: spacing.sm,
                    },
                ]}
            >
                {title}
            </Text>

            <Text
                style={[
                    styles.message,
                    {
                        color: colors.textSecondary,
                        fontFamily: fonts.regular,
                        marginBottom: spacing.lg,
                    },
                ]}
            >
                {message}
            </Text>

            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: colors.primary,
                            borderRadius: radius.md,
                            paddingVertical: spacing.md,
                            paddingHorizontal: spacing.lg,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionText,
                            { color: '#fff', fontFamily: fonts.semiBold },
                        ]}
                    >
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        fontSize: 16,
    },
});

export default EmptyState;
