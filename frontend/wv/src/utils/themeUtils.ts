import { StyleSheet } from 'react-native';
import { ThemeColors } from '../context/ThemeContext';

// Create styles with theme colors
export const createStyles = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styles: (colors: ThemeColors) => T
) => {
  return styles;
};

// Common theme-aware components props
export interface ThemeAwareProps {
  theme: {
    colors: ThemeColors;
    isDark: boolean;
  };
}

// Utility to get contrast color
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation (for demo)
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};