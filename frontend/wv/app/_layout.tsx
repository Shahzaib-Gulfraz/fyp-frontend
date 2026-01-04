import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";

import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { UserProvider } from "@/src/context/UserContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AppProviders />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppProviders() {
  const {
    paperTheme,
    navigationTheme,
    themeReady,
    isDark,
  } = useTheme();

  if (!themeReady) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
