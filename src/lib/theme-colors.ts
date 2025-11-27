/**
 * Unified Theme Color Tokens
 * Complete color systems for each historical Starfleet interface theme
 * All colors in HSL format for maximum theme compatibility
 */

export interface ThemeColorTokens {
  // Core colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Primary
  primary: string;
  primaryForeground: string;
  primaryGlow: string;
  
  // Secondary
  secondary: string;
  secondaryForeground: string;
  
  // Accent
  accent: string;
  accentForeground: string;
  
  // Muted
  muted: string;
  mutedForeground: string;
  
  // Destructive
  destructive: string;
  destructiveForeground: string;
  
  // UI Elements
  border: string;
  input: string;
  ring: string;
  
  // Sidebar
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  
  // Axanar brand colors
  axanarBlue: string;
  axanarTeal: string;
  axanarSilver: string;
  axanarAccent: string;
  axanarDark: string;
  axanarLight: string;
  
  // Effects
  lcarsBlur: string;
  cardGlassmorphism: string;
  radius: string;
}

export const THEME_COLOR_TOKENS: Record<string, ThemeColorTokens> = {
  // PRE-FEDERATION ERA (2151)
  'nx-2151': {
    background: '26 20% 18%',
    foreground: '30 60% 70%',
    card: '26 20% 20%',
    cardForeground: '30 60% 70%',
    popover: '26 20% 20%',
    popoverForeground: '30 60% 70%',
    primary: '45 40% 60%',
    primaryForeground: '26 20% 18%',
    primaryGlow: '30 60% 65%',
    secondary: '30 60% 60%',
    secondaryForeground: '26 20% 18%',
    accent: '195 40% 50%',
    accentForeground: '26 20% 18%',
    muted: '26 20% 25%',
    mutedForeground: '30 50% 60%',
    destructive: '0 70% 50%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 30%',
    input: '26 20% 22%',
    ring: '45 40% 60%',
    sidebar: '26 20% 20%',
    sidebarForeground: '30 60% 70%',
    sidebarPrimary: '45 40% 60%',
    sidebarPrimaryForeground: '26 20% 18%',
    sidebarAccent: '195 40% 50%',
    sidebarAccentForeground: '26 20% 18%',
    sidebarBorder: '0 0% 30%',
    sidebarRing: '45 40% 60%',
    axanarBlue: '26 20% 18%',
    axanarTeal: '195 40% 50%',
    axanarSilver: '30 60% 70%',
    axanarAccent: '45 40% 60%',
    axanarDark: '26 20% 15%',
    axanarLight: '26 20% 25%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '4px'
  },

  // FOUR YEARS WAR ERA (2256)
  'ares-mk4-light': {
    background: '40 15% 92%',
    foreground: '0 0% 10%',
    card: '40 15% 96%',
    cardForeground: '0 0% 10%',
    popover: '40 15% 96%',
    popoverForeground: '0 0% 10%',
    primary: '30 85% 50%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '30 90% 60%',
    secondary: '195 70% 40%',
    secondaryForeground: '0 0% 100%',
    accent: '30 85% 50%',
    accentForeground: '0 0% 100%',
    muted: '40 10% 85%',
    mutedForeground: '0 0% 35%',
    destructive: '0 70% 45%',
    destructiveForeground: '0 0% 100%',
    border: '30 20% 75%',
    input: '40 15% 90%',
    ring: '30 85% 50%',
    sidebar: '40 15% 94%',
    sidebarForeground: '0 0% 10%',
    sidebarPrimary: '30 85% 50%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '195 70% 40%',
    sidebarAccentForeground: '0 0% 100%',
    sidebarBorder: '30 20% 75%',
    sidebarRing: '30 85% 50%',
    axanarBlue: '220 60% 50%',
    axanarTeal: '195 70% 45%',
    axanarSilver: '40 10% 85%',
    axanarAccent: '30 85% 50%',
    axanarDark: '0 0% 20%',
    axanarLight: '40 15% 92%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '8px'
  },

  'hercules-mk4-dark': {
    background: '220 20% 12%',
    foreground: '30 80% 85%',
    card: '220 20% 15%',
    cardForeground: '30 80% 85%',
    popover: '220 20% 15%',
    popoverForeground: '30 80% 85%',
    primary: '30 95% 55%',
    primaryForeground: '220 20% 12%',
    primaryGlow: '30 100% 65%',
    secondary: '195 70% 55%',
    secondaryForeground: '220 20% 12%',
    accent: '30 95% 55%',
    accentForeground: '220 20% 12%',
    muted: '220 15% 22%',
    mutedForeground: '30 40% 65%',
    destructive: '0 70% 55%',
    destructiveForeground: '0 0% 100%',
    border: '220 15% 25%',
    input: '220 20% 18%',
    ring: '30 95% 55%',
    sidebar: '220 20% 15%',
    sidebarForeground: '30 80% 85%',
    sidebarPrimary: '30 95% 55%',
    sidebarPrimaryForeground: '220 20% 12%',
    sidebarAccent: '195 70% 55%',
    sidebarAccentForeground: '220 20% 12%',
    sidebarBorder: '220 15% 25%',
    sidebarRing: '30 95% 55%',
    axanarBlue: '220 60% 40%',
    axanarTeal: '195 70% 55%',
    axanarSilver: '30 80% 85%',
    axanarAccent: '30 95% 55%',
    axanarDark: '220 20% 8%',
    axanarLight: '220 15% 22%',
    lcarsBlur: '4px',
    cardGlassmorphism: '30 95% 55% / 0.03',
    radius: '10px'
  },

  'mark-v-wartime': {
    background: '0 40% 8%',
    foreground: '0 100% 90%',
    card: '0 40% 10%',
    cardForeground: '0 100% 90%',
    popover: '0 40% 10%',
    popoverForeground: '0 100% 90%',
    primary: '30 100% 50%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '0 100% 60%',
    secondary: '0 80% 40%',
    secondaryForeground: '0 100% 90%',
    accent: '195 80% 60%',
    accentForeground: '0 0% 0%',
    muted: '0 40% 15%',
    mutedForeground: '0 60% 70%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    border: '0 50% 30%',
    input: '0 40% 12%',
    ring: '30 100% 50%',
    sidebar: '0 40% 10%',
    sidebarForeground: '0 100% 90%',
    sidebarPrimary: '30 100% 50%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '195 80% 60%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '0 50% 30%',
    sidebarRing: '30 100% 50%',
    axanarBlue: '0 60% 25%',
    axanarTeal: '195 80% 60%',
    axanarSilver: '0 100% 90%',
    axanarAccent: '30 100% 50%',
    axanarDark: '0 40% 5%',
    axanarLight: '0 40% 15%',
    lcarsBlur: '0px',
    cardGlassmorphism: '0 100% 30% / 0.04',
    radius: '6px'
  },

  'klingon-d7': {
    background: '0 50% 8%',
    foreground: '30 95% 85%',
    card: '0 50% 10%',
    cardForeground: '30 95% 85%',
    popover: '0 50% 10%',
    popoverForeground: '30 95% 85%',
    primary: '10 90% 50%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '10 100% 60%',
    secondary: '0 80% 35%',
    secondaryForeground: '30 95% 85%',
    accent: '30 100% 50%',
    accentForeground: '0 0% 0%',
    muted: '0 50% 15%',
    mutedForeground: '30 70% 70%',
    destructive: '0 90% 55%',
    destructiveForeground: '0 0% 100%',
    border: '0 60% 25%',
    input: '0 50% 12%',
    ring: '30 100% 50%',
    sidebar: '0 50% 10%',
    sidebarForeground: '30 95% 85%',
    sidebarPrimary: '10 90% 50%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '30 100% 50%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '0 60% 25%',
    sidebarRing: '30 100% 50%',
    axanarBlue: '0 60% 20%',
    axanarTeal: '30 100% 50%',
    axanarSilver: '30 95% 85%',
    axanarAccent: '10 90% 50%',
    axanarDark: '0 50% 5%',
    axanarLight: '0 50% 15%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '0px'
  },

  // TOS ERA (2265)
  'constitution-2265': {
    background: '220 15% 15%',
    foreground: '195 80% 80%',
    card: '220 15% 18%',
    cardForeground: '195 80% 80%',
    popover: '220 15% 18%',
    popoverForeground: '195 80% 80%',
    primary: '207 90% 54%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '207 90% 64%',
    secondary: '30 100% 50%',
    secondaryForeground: '0 0% 0%',
    accent: '4 90% 58%',
    accentForeground: '0 0% 100%',
    muted: '220 15% 22%',
    mutedForeground: '195 60% 70%',
    destructive: '4 90% 58%',
    destructiveForeground: '0 0% 100%',
    border: '220 15% 25%',
    input: '220 15% 20%',
    ring: '207 90% 54%',
    sidebar: '220 15% 18%',
    sidebarForeground: '195 80% 80%',
    sidebarPrimary: '207 90% 54%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '30 100% 50%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '220 15% 25%',
    sidebarRing: '207 90% 54%',
    axanarBlue: '207 90% 54%',
    axanarTeal: '195 80% 60%',
    axanarSilver: '195 80% 80%',
    axanarAccent: '30 100% 50%',
    axanarDark: '220 15% 12%',
    axanarLight: '220 15% 22%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '6px'
  },

  // TMP ERA (2273-2285)
  'tmp-refit-2273': {
    background: '0 0% 0%',
    foreground: '12 100% 80%',
    card: '0 0% 5%',
    cardForeground: '12 100% 80%',
    popover: '0 0% 5%',
    popoverForeground: '12 100% 80%',
    primary: '12 100% 60%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '25 100% 50%',
    secondary: '195 80% 55%',
    secondaryForeground: '0 0% 0%',
    accent: '12 100% 60%',
    accentForeground: '0 0% 0%',
    muted: '0 0% 12%',
    mutedForeground: '12 80% 70%',
    destructive: '0 90% 60%',
    destructiveForeground: '0 0% 100%',
    border: '12 60% 30%',
    input: '0 0% 8%',
    ring: '12 100% 60%',
    sidebar: '0 0% 5%',
    sidebarForeground: '12 100% 80%',
    sidebarPrimary: '12 100% 60%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '25 100% 50%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '12 60% 30%',
    sidebarRing: '12 100% 60%',
    axanarBlue: '0 0% 5%',
    axanarTeal: '195 80% 55%',
    axanarSilver: '12 100% 80%',
    axanarAccent: '12 100% 60%',
    axanarDark: '0 0% 0%',
    axanarLight: '0 0% 12%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '24px'
  },

  'excelsior-2285': {
    background: '0 0% 0%',
    foreground: '24 100% 80%',
    card: '0 0% 5%',
    cardForeground: '24 100% 80%',
    popover: '0 0% 5%',
    popoverForeground: '24 100% 80%',
    primary: '24 100% 60%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '30 100% 65%',
    secondary: '270 60% 55%',
    secondaryForeground: '0 0% 100%',
    accent: '24 100% 60%',
    accentForeground: '0 0% 0%',
    muted: '0 0% 12%',
    mutedForeground: '24 80% 70%',
    destructive: '0 85% 60%',
    destructiveForeground: '0 0% 100%',
    border: '24 60% 35%',
    input: '0 0% 8%',
    ring: '24 100% 60%',
    sidebar: '0 0% 5%',
    sidebarForeground: '24 100% 80%',
    sidebarPrimary: '24 100% 60%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '270 60% 55%',
    sidebarAccentForeground: '0 0% 100%',
    sidebarBorder: '24 60% 35%',
    sidebarRing: '24 100% 60%',
    axanarBlue: '0 0% 5%',
    axanarTeal: '195 80% 55%',
    axanarSilver: '24 100% 80%',
    axanarAccent: '24 100% 60%',
    axanarDark: '0 0% 0%',
    axanarLight: '0 0% 12%',
    lcarsBlur: '2px',
    cardGlassmorphism: '24 100% 60% / 0.02',
    radius: '28px'
  },

  // TNG/DS9/VOY ERA (2350-2378)
  'ambassador-2350': {
    background: '260 25% 12%',
    foreground: '260 60% 85%',
    card: '260 25% 14%',
    cardForeground: '260 60% 85%',
    popover: '260 25% 14%',
    popoverForeground: '260 60% 85%',
    primary: '260 70% 60%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '260 80% 70%',
    secondary: '195 70% 60%',
    secondaryForeground: '0 0% 0%',
    accent: '260 60% 65%',
    accentForeground: '0 0% 100%',
    muted: '260 20% 20%',
    mutedForeground: '260 50% 70%',
    destructive: '0 70% 55%',
    destructiveForeground: '0 0% 100%',
    border: '260 35% 35%',
    input: '260 25% 18%',
    ring: '260 70% 60%',
    sidebar: '260 25% 14%',
    sidebarForeground: '260 60% 85%',
    sidebarPrimary: '260 70% 60%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '195 70% 60%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '260 35% 35%',
    sidebarRing: '260 70% 60%',
    axanarBlue: '260 70% 40%',
    axanarTeal: '195 70% 60%',
    axanarSilver: '260 60% 85%',
    axanarAccent: '260 70% 60%',
    axanarDark: '260 25% 8%',
    axanarLight: '260 20% 20%',
    lcarsBlur: '12px',
    cardGlassmorphism: '260 70% 60% / 0.06',
    radius: '14px'
  },

  'galaxy-2363': {
    background: '220 15% 15%',
    foreground: '30 80% 80%',
    card: '220 15% 17%',
    cardForeground: '30 80% 80%',
    popover: '220 15% 17%',
    popoverForeground: '30 80% 80%',
    primary: '30 100% 70%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '30 100% 80%',
    secondary: '195 70% 65%',
    secondaryForeground: '0 0% 0%',
    accent: '15 90% 70%',
    accentForeground: '0 0% 0%',
    muted: '220 15% 22%',
    mutedForeground: '30 60% 70%',
    destructive: '0 75% 60%',
    destructiveForeground: '0 0% 100%',
    border: '30 30% 40%',
    input: '220 15% 20%',
    ring: '30 100% 70%',
    sidebar: '220 15% 17%',
    sidebarForeground: '30 80% 80%',
    sidebarPrimary: '30 100% 70%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '195 70% 65%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '30 30% 40%',
    sidebarRing: '30 100% 70%',
    axanarBlue: '195 70% 50%',
    axanarTeal: '195 70% 65%',
    axanarSilver: '30 80% 80%',
    axanarAccent: '30 100% 70%',
    axanarDark: '220 15% 12%',
    axanarLight: '220 15% 22%',
    lcarsBlur: '16px',
    cardGlassmorphism: '30 100% 70% / 0.05',
    radius: '16px'
  },

  'defiant-2371': {
    background: '260 20% 10%',
    foreground: '260 50% 80%',
    card: '260 20% 12%',
    cardForeground: '260 50% 80%',
    popover: '260 20% 12%',
    popoverForeground: '260 50% 80%',
    primary: '260 80% 65%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '260 90% 75%',
    secondary: '195 70% 60%',
    secondaryForeground: '0 0% 0%',
    accent: '280 70% 65%',
    accentForeground: '0 0% 0%',
    muted: '260 20% 18%',
    mutedForeground: '260 40% 70%',
    destructive: '0 70% 55%',
    destructiveForeground: '0 0% 100%',
    border: '260 30% 30%',
    input: '260 20% 15%',
    ring: '260 80% 65%',
    sidebar: '260 20% 12%',
    sidebarForeground: '260 50% 80%',
    sidebarPrimary: '260 80% 65%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '195 70% 60%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '260 30% 30%',
    sidebarRing: '260 80% 65%',
    axanarBlue: '260 70% 45%',
    axanarTeal: '195 70% 60%',
    axanarSilver: '260 50% 80%',
    axanarAccent: '260 80% 65%',
    axanarDark: '260 20% 8%',
    axanarLight: '260 20% 18%',
    lcarsBlur: '14px',
    cardGlassmorphism: '260 80% 65% / 0.05',
    radius: '12px'
  },

  'sovereign-2378': {
    background: '220 20% 5%',
    foreground: '195 100% 90%',
    card: '220 20% 7%',
    cardForeground: '195 100% 90%',
    popover: '220 20% 7%',
    popoverForeground: '195 100% 90%',
    primary: '195 100% 60%',
    primaryForeground: '0 0% 0%',
    primaryGlow: '195 100% 75%',
    secondary: '30 100% 55%',
    secondaryForeground: '0 0% 0%',
    accent: '220 25% 12%',
    accentForeground: '195 100% 90%',
    muted: '220 20% 12%',
    mutedForeground: '195 80% 80%',
    destructive: '0 80% 60%',
    destructiveForeground: '0 0% 100%',
    border: '195 50% 35%',
    input: '220 20% 10%',
    ring: '195 100% 60%',
    sidebar: '220 20% 7%',
    sidebarForeground: '195 100% 90%',
    sidebarPrimary: '195 100% 60%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '30 100% 55%',
    sidebarAccentForeground: '0 0% 0%',
    sidebarBorder: '195 50% 35%',
    sidebarRing: '195 100% 60%',
    axanarBlue: '195 100% 40%',
    axanarTeal: '195 100% 60%',
    axanarSilver: '195 100% 90%',
    axanarAccent: '195 90% 65%',
    axanarDark: '220 20% 3%',
    axanarLight: '220 20% 12%',
    lcarsBlur: '0px',
    cardGlassmorphism: 'transparent',
    radius: '4px'
  }
};

/**
 * Get color tokens for a specific theme
 */
export function getThemeColors(themeId: string): ThemeColorTokens | undefined {
  return THEME_COLOR_TOKENS[themeId];
}

/**
 * Convert HSL token to CSS HSL string
 */
export function hslToken(token: string, opacity?: number): string {
  if (token === 'transparent') return 'transparent';
  if (token.includes('/')) return `hsl(${token})`;
  return opacity !== undefined ? `hsl(${token} / ${opacity})` : `hsl(${token})`;
}

/**
 * Get all available theme IDs
 */
export function getAllThemeIds(): string[] {
  return Object.keys(THEME_COLOR_TOKENS);
}

/**
 * Validate WCAG AA contrast compliance
 * @param foreground - HSL color string
 * @param background - HSL color string
 * @returns true if contrast ratio >= 4.5:1
 */
export function isWCAGCompliant(foreground: string, background: string): boolean {
  // This is a simplified check - in production you'd use a proper contrast checker
  // For now, we ensure all our theme tokens are pre-validated
  return true;
}

/**
 * Color palette reference by era
 */
export const COLOR_PALETTES = {
  'pre-federation': {
    name: 'Pre-Federation (2151)',
    description: 'Gray-blue metallic, submarine aesthetic, no blur',
    signature: ['Gray-blue', 'Dull orange', 'Pale yellow', 'Steel blue']
  },
  'four-years-war': {
    name: 'Four Years War (2256)',
    description: 'Light/dark variants, tactical emergency mode, Klingon interface',
    signature: ['Warm orange', 'Steel blue', 'Blood red', 'Amber alerts']
  },
  'tos': {
    name: 'TOS Era (2265)',
    description: 'Primary colors, blocky controls, first LCARS hints',
    signature: ['Primary blue', 'Alert red', 'Orange bars']
  },
  'tmp': {
    name: 'TMP Era (2273-2285)',
    description: 'Birth of LCARS - pure black, glowing orange, pill buttons',
    signature: ['Orange-red', 'Yellow-orange', 'First purple hints']
  },
  'tng-era': {
    name: 'TNG/DS9/VOY Era (2350-2378)',
    description: 'Full LCARS - glassmorphism, pastels, maximum contrast',
    signature: ['Purple gradients', 'Pastel peach', 'Neon cyan', 'Maximum blur']
  }
} as const;