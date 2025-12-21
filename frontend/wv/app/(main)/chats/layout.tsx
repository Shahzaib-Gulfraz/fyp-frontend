import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function ChatsLayout() {
    const { isDark, theme } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.background,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontFamily: 'Inter_600SemiBold',
                    },
                    contentStyle: {
                        backgroundColor: theme.colors.background,
                    },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="[id]"
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="new"
                    options={{
                        presentation: 'modal',
                        headerShown: false
                    }}
                />
            </Stack>
        </>
    );
}
