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
    const inSplash = pathname === "/splash" || pathname === "/";
    const inSellerGroup = segments.includes("seller") || (segments.length > 0 && segments[0] === "seller");
    const inMainGroup = segments.includes("(main)");
    const inAdminGroup = segments.includes("(admin)");

    // Allow unauthenticated access to splash and auth screens only
    if (!isAuthenticated) {
      if (inSplash || inAuthGroup) {
        // Allow these screens
        return;
      }
      // Redirect any other unauthenticated access to index (presplash)
      console.log('🚫 RootLayout: Unauthenticated user trying to access protected route, redirecting to presplash');
      router.replace("/");
      return;
    }

    // Authenticated users - redirect to their appropriate dashboard if on splash/auth
    if (isAuthenticated && (inSplash || inAuthGroup)) {
      if (userType === 'shop') {
        console.log('🏪 RootLayout: Authenticated shop on splash/auth, redirecting to seller dashboard');
        router.replace("/seller/dashboard");
      } else if (userType === 'admin') {
        console.log('👑 RootLayout: Authenticated admin on splash/auth, redirecting to admin dashboard');
        router.replace("/(admin)/dashboard");
      } else {
        console.log('👤 RootLayout: Authenticated user on splash/auth, redirecting to home');
        router.replace("/(main)/home");
      }
      return;
    }

    // Prevent shop users from accessing main/admin routes
    if (isAuthenticated && userType === "shop" && (inMainGroup || inAdminGroup)) {
      console.log('🏪 RootLayout: Shop user in wrong group, redirecting to seller dashboard');
      router.replace("/seller/dashboard");
      return;
    }

    // Prevent regular users from accessing seller/admin routes
    if (isAuthenticated && userType === "user" && (inSellerGroup || inAdminGroup)) {
      console.log('👤 RootLayout: Regular user in wrong group, redirecting to home');
      router.replace("/(main)/home");
      return;
    }

    // Prevent admin from accessing regular/seller routes (optional)
    if (isAuthenticated && userType === "admin" && (inMainGroup || inSellerGroup)) {
      console.log('👑 RootLayout: Admin in wrong group, redirecting to admin dashboard');
      router.replace("/(admin)/dashboard");
      return;
    }
  }, [isAuthenticated, userType, isLoading, segments, pathname]);

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
