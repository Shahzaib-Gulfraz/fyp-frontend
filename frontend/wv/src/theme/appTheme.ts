// src/theme/appTheme.ts

/* ─────────────────────────────
   Types
───────────────────────────── */
export type AppThemeMode = "light" | "dark";

export interface AppThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  accent: string;
  card: string;
  divider: string;
  textTertiary: string;
  success: string;
  onPrimary: string;
  surfaceVariant: string;
  warning: string;
  disabled: string;
}

export interface AppThemeGradients {
  primary: string[];
  accent: string[];
}

export interface AppThemeStructure {
  colors: AppThemeColors;
  gradients: AppThemeGradients;
}

export interface AppTheme {
  light: AppThemeStructure;
  dark: AppThemeStructure;
  tokens: {
    spacing: Record<string, number>;
    radius: Record<string, number>;
    fonts: Record<string, string>;
  };
}

/* ─────────────────────────────
   App Theme
───────────────────────────── */
export const appTheme: AppTheme = {
  light: {
    colors: {
      primary: "#2196F3",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#000000",
      textSecondary: "#666666",
      border: "#eeeeee",
      error: "#FF3B30",
      accent: "#7B61FF",
      card: "#ffffff",
      divider: "#eeeeee",
      textTertiary: "#999999",
      success: "#4CAF50",
      onPrimary: "#ffffff",
      surfaceVariant: "#f0f0f0",
      warning: "#FF9800",
      disabled: "#BDBDBD",

    },
    gradients: {
      primary: ["#ffffff", "#f5f5f5"],
      accent: ["#2196F3", "#7B61FF"],
    },
  },
  dark: {
    colors: {
      primary: "#2196F3",
      background: "#121212",
      surface: "#1e1e1e",
      text: "#ffffff",
      textSecondary: "#aaaaaa",
      border: "#333333",
      error: "#FF3B30",
      accent: "#9D89FF",
      card: "#1e1e1e",
      divider: "#333333",
      textTertiary: "#777777",
      success: "#4CAF50",
      onPrimary: "#ffffff",
      surfaceVariant: "#2c2c2c",
      warning: "#FF9800",
      disabled: "#555555",

    },
    gradients: {
      primary: ["#000000", "#1e1e1e"],
      accent: ["#2196F3", "#9D89FF"],
    },
  },
  tokens: {
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radius: { sm: 6, md: 12, lg: 20, full: 9999 },
    fonts: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semiBold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
  },
};
