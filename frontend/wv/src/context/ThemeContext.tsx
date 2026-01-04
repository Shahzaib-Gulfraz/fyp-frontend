// src/context/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";
import { appTheme, AppThemeStructure, AppThemeGradients, AppThemeMode, AppThemeColors } from "@/src/theme/appTheme";

import {
  DefaultTheme as NavigationLight,
  DarkTheme as NavigationDark,
  Theme as NavigationTheme,
} from "@react-navigation/native";


export type ThemeColors = AppThemeColors;
export type ThemeMode = "light" | "dark" | "system";

export type AppThemeType = typeof appTheme.light & { gradients: { primary: string[]; accent: string[] } };
export type AppTokensType = typeof appTheme.tokens;

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  themeReady: boolean;

  appTheme: AppThemeType;
  theme: AppThemeType;
  colors: ThemeColors; // Added for easy access
  tokens: AppTokensType;
  gradients: AppThemeType["gradients"];

  paperTheme: MD3Theme;
  navigationTheme: NavigationTheme;

  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

/* ─────────────────────────────
   Tokens (Global Design System)
───────────────────────────── */
const tokens = appTheme.tokens;

/* ─────────────────────────────
   Context
───────────────────────────── */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/* ─────────────────────────────
   Provider
───────────────────────────── */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [themeReady, setThemeReady] = useState(false);

  /* Resolve final theme */
  const isDark =
    themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";
  const resolvedTheme: "light" | "dark" = isDark ? "dark" : "light";

  /* Current App Theme */
  const currentAppTheme: AppThemeType = {
    ...appTheme[resolvedTheme],
    gradients: appTheme[resolvedTheme].gradients
  };

  /* React Native Paper Theme */
  const paperTheme: MD3Theme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: currentAppTheme.colors.primary,
      background: currentAppTheme.colors.background,
      surface: currentAppTheme.colors.surface,
      onSurface: currentAppTheme.colors.text,
      outline: currentAppTheme.colors.border,
      secondary: currentAppTheme.colors.accent,
      error: currentAppTheme.colors.error,
    },
  };


  /* React Navigation Theme */
  const navigationTheme: NavigationTheme = {
    ...(isDark ? NavigationDark : NavigationLight),
    colors: {
      ...(isDark ? NavigationDark.colors : NavigationLight.colors),
      primary: currentAppTheme.colors.primary,
      background: currentAppTheme.colors.background,
      card: currentAppTheme.colors.surface,
      text: currentAppTheme.colors.text,
      border: currentAppTheme.colors.border,
    },
  };

  /* Load saved theme */
  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("@wearvirtually_theme");
        if (storedTheme) {
          setThemeModeState(storedTheme as ThemeMode);
        }
      } catch (e) {
        console.log("Theme load error:", e);
      } finally {
        setThemeReady(true);
      }
    })();
  }, []);

  /* Persist Theme */
  const persistTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("@wearvirtually_theme", mode);
    } catch (e) {
      console.log("Theme save error:", e);
    }
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemeModeState(next);
    persistTheme(next);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    persistTheme(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        isDark,
        themeReady,

        appTheme: currentAppTheme,
        theme: currentAppTheme,
        colors: currentAppTheme.colors,
        tokens,
        gradients: currentAppTheme.gradients,

        paperTheme,
        navigationTheme,

        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/* ─────────────────────────────
   Hook
───────────────────────────── */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
