import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { UserProvider } from "../src/context/UserContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

function RootLayoutNav() {
  const { isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  // Re-check auth when navigating to main group
  React.useEffect(() => {
    const inMainGroup = segments[0] === "(main)";

    if (inMainGroup) {
      console.log('🔄 Navigating to main group, re-checking auth...');
      checkAuth();
    }
  }, [segments]);

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    console.log('🔍 Auth check - isAuthenticated:', isAuthenticated, 'inAuthGroup:', inAuthGroup, 'segments:', segments);

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('🔄 Redirecting to login (not authenticated)');
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth screens
      console.log('🔄 Redirecting to home (authenticated in auth group)');
      router.replace("/(main)/home");
    }
  }, [isAuthenticated, segments, isLoading]);



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(ar)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});
