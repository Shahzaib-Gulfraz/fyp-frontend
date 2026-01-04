// src/theme/paperTheme.ts
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { appTheme } from "./appTheme";

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appTheme.light.colors.primary,
    background: appTheme.light.colors.background,
    surface: appTheme.light.colors.surface,
    onBackground: appTheme.light.colors.text,
    onSurface: appTheme.light.colors.text,
    outline: appTheme.light.colors.border,
    error: appTheme.light.colors.error,
    secondary: appTheme.light.colors.accent,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: appTheme.dark.colors.primary,
    background: appTheme.dark.colors.background,
    surface: appTheme.dark.colors.surface,
    onBackground: appTheme.dark.colors.text,
    onSurface: appTheme.dark.colors.text,
    outline: appTheme.dark.colors.border,
    error: appTheme.dark.colors.error,
    secondary: appTheme.dark.colors.accent,
  },
};
