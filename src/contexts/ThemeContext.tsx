import React, { createContext, useContext, useEffect, useState } from 'react';
import { LCARSEra, DEFAULT_ERA } from '@/lib/lcars-eras';

type Theme = 'dark' | 'light' | 'tactical' | 'klingon';

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  era: LCARSEra;
  setEra: (era: LCARSEra) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark', // Axanar defaults to dark mode (82% mobile preference)
  storageKey = 'axanar-ui-theme',
  eraStorageKey = 'axanar-lcars-era',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  eraStorageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [era, setEra] = useState<LCARSEra>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(eraStorageKey) as LCARSEra) || DEFAULT_ERA;
    }
    return DEFAULT_ERA;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark', 'tactical', 'klingon');
    root.classList.add(theme);
    
    // Store theme preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all era classes
    root.classList.remove(
      'era-mark-iv', 'era-mark-v-war', 'era-block-i', 'era-block-ii',
      'era-block-iii', 'era-block-iv', 'era-block-v', 'era-block-vi', 'era-block-vii'
    );
    
    // Add current era class
    const eraClass = era.replace(/-\d{4}$/, '').replace(/(\d+)/g, '-$1');
    root.classList.add(`era-${eraClass}`);
    
    // Store era preference
    localStorage.setItem(eraStorageKey, era);
  }, [era, eraStorageKey]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      switch (prevTheme) {
        case 'light': return 'dark';
        case 'dark': return 'tactical';
        case 'tactical': return 'klingon';
        case 'klingon': return 'light';
        default: return 'dark';
      }
    });
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    era,
    setEra,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};