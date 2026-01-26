import React from "react";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";

import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { UserProvider } from "@/src/context/UserContext";
import { SocketProvider } from "@/src/context/SocketContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <SocketProvider>
            <AppProviders />
          </SocketProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, userType, isLoading, checkAuth } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (isLoading) return;

    console.log('🔍 RootLayout: Segments:', segments, 'Path:', pathname);
    console.log('🔍 RootLayout: Auth:', { isAuthenticated, userType, isLoading });

    const inAuthGroup = segments.includes("(auth)");
    const inMainGroup = segments.includes("(main)") || (segments.length > 0 && segments[0] !== "(auth)" && segments[0] !== "(admin)");

    if (!isAuthenticated && inMainGroup) {
      console.log('🚫 RootLayout: Unauthenticated in main group, redirecting to login');
      router.replace("/(auth)/login");
    } 
    /* 
    // TEMPORARY: Allow access to login page even if authenticated
    else if (isAuthenticated && inAuthGroup) {
      console.log('✅ RootLayout: Authenticated in auth group, redirecting to dashboard');
      if (userType === "admin") {
        router.replace("/(admin)/dashboard");
      } else if (userType === "shop") {
        router.replace("/seller/dashboard");
      } else {
        router.replace("/(main)/home");
      }
    } 
    */
  }, [isAuthenticated, userType, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
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
        <RootLayoutNav />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
