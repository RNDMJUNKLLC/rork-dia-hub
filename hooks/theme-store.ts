import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [isDarkMode]);

  const colors = useMemo(() => ({
    background: isDarkMode ? '#000' : '#F2F2F7',
    cardBackground: isDarkMode ? '#1C1C1E' : '#fff',
    text: isDarkMode ? '#fff' : '#000',
    textSecondary: isDarkMode ? '#8E8E93' : '#666',
    border: isDarkMode ? '#38383A' : '#E5E5EA',
    primary: '#007AFF',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    modalBackground: isDarkMode ? '#1C1C1E' : '#fff',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    inputBackground: isDarkMode ? '#2C2C2E' : '#F2F2F7',
    tabBarBackground: isDarkMode ? '#1C1C1E' : '#fff',
    tabBarBorder: isDarkMode ? '#38383A' : '#E5E5EA',
  }), [isDarkMode]);

  return useMemo(() => ({
    isDarkMode,
    toggleDarkMode,
    colors,
    isLoading,
  }), [isDarkMode, toggleDarkMode, colors, isLoading]);
});