import { Stack } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function ChatsLayout() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
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