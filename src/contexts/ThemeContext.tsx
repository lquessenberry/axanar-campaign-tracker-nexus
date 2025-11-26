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
      'era-nx-2151', 'era-constitution-2265', 'era-tmp-refit-2273', 
      'era-excelsior-2285', 'era-mark-v-war', 'era-ambassador-2350',
      'era-galaxy-2363', 'era-defiant-2371', 'era-sovereign-2378'
    );
    
    // Add current era class (CSS class names match era IDs exactly)
    const eraClass = `era-${era}`;
    root.classList.add(eraClass);
    
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