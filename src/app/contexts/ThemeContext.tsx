import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 * 
 * Provides theme context to the entire application.
 * Manages dark/light mode with persistent storage.
 * 
 * Features:
 * - Reads user preference from localStorage
 * - Respects system preferences
 * - Applies theme via data attribute
 * - Smooth transitions between themes
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return defaultTheme;
  });

  const [isDark, setIsDark] = useState(false);

  // Determine actual dark mode based on theme
  useEffect(() => {
    let actualTheme = theme;

    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    const isDarkTheme = actualTheme === 'dark';
    setIsDark(isDarkTheme);

    // Apply theme to document
    document.documentElement.setAttribute(
      'data-theme',
      isDarkTheme ? 'dark' : 'light'
    );

    // Update CSS class for Tailwind dark mode (if using Tailwind dark mode)
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update color-scheme for native elements
    document.documentElement.style.colorScheme = isDarkTheme ? 'dark' : 'light';
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDark(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    handleSetTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme: handleSetTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * 
 * Access theme context from any component.
 * 
 * Usage:
 * const { isDark, toggleTheme, theme, setTheme } = useTheme();
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
