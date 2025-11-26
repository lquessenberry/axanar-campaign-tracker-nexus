import React, { createContext, useContext, useEffect, useState } from 'react';
import { UnifiedTheme, DEFAULT_THEME } from '@/lib/unified-themes';

type ThemeProviderContextType = {
  theme: UnifiedTheme;
  setTheme: (theme: UnifiedTheme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = 'axanar-unified-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: UnifiedTheme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<UnifiedTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as UnifiedTheme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    const allThemeClasses = [
      'theme-nx-2151',
      'theme-ares-mk4-light',
      'theme-hercules-mk4-dark',
      'theme-mark-v-wartime',
      'theme-klingon-d7',
      'theme-constitution-2265',
      'theme-tmp-refit-2273',
      'theme-excelsior-2285',
      'theme-ambassador-2350',
      'theme-galaxy-2363',
      'theme-defiant-2371',
      'theme-sovereign-2378'
    ];
    
    root.classList.remove(...allThemeClasses);
    
    // Add current theme class
    const themeClass = `theme-${theme}`;
    root.classList.add(themeClass);
    
    // Store theme preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme,
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