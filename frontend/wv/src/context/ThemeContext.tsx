import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Define theme color palette
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // UI elements
  border: string;
  divider: string;
  shadow: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Custom colors
  accent: string;
  accentLight: string;
}

// Define theme object
export interface Theme {
  colors: ThemeColors;
  mode: ThemeMode;
}

// Predefined color palettes
const lightColors: ThemeColors = {
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',

  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  border: '#E0E0E0',
  divider: '#F0F0F0',
  shadow: '#00000010',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF5252',
  info: '#2196F3',

  accent: '#00BCD4',
  accentLight: '#B2EBF2',
};

const darkColors: ThemeColors = {
  primary: '#FFFFFF',
  primaryLight: '#CCCCCC',
  primaryDark: '#FFFFFF',

  background: '#0F0F1E',
  surface: '#1A1A2E',
  card: '#16213E',

  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#8A8AA3',

  border: '#333344',
  divider: '#2A2A3A',
  shadow: '#00000040',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF5252',
  info: '#2196F3',

  accent: '#00BCD4',
  accentLight: '#004D40',
};

// Theme Context
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);

  // Load saved theme from storage
  useEffect(() => {
    loadTheme();
  }, []);

  // Update isDark based on theme mode
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@wearvirtually_theme');
      if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('@wearvirtually_theme', mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveTheme(newMode);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveTheme(mode);
  };

  // Get current theme colors
  const colors = isDark ? darkColors : lightColors;

  const theme: Theme = {
    colors,
    mode: themeMode,
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      isDark,
      toggleTheme,
      setThemeMode: handleSetThemeMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};