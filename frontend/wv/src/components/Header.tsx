import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightIcon?: React.ReactNode;
    style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    onBackPress,
    rightIcon,
    style,
}) => {
    const { colors } = useTheme();
    const { spacing, fonts } = appTheme.tokens;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }, style]}>
            <View style={styles.leftContainer}>
                {showBackButton && (
                    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                {rightIcon}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
    },
});

export default Header;
