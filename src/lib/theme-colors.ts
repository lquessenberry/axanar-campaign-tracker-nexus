/**
 * Unified Theme Color Tokens
 * Complete color systems for each historical Starfleet interface theme
 */

export interface ThemeColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  accent: string;
  lcarsBlur: string;
  border: string;
  card: string;
  cardForeground: string;
  cardGlassmorphism: string;
  muted?: string;
  mutedForeground?: string;
  destructive?: string;
  buttonRadius?: string;
  cardRadius?: string;
}

export const THEME_COLOR_TOKENS: Record<string, ThemeColorTokens> = {
  // PRE-FEDERATION ERA (2151)
  'nx-2151': {
    background: '26 20% 18%',           // Gray-blue metallic #1a2a3a
    foreground: '30 60% 70%',           // Dull orange #CC8844
    primary: '45 40% 60%',              // Pale yellow #DDCC88
    primaryGlow: '30 60% 65%',
    secondary: '30 60% 60%',            // Dull orange
    accent: '195 40% 50%',              // Steel blue
    lcarsBlur: '0px',                   // NO BLUR - hard edges
    border: '0 0% 30%',                 // Dark gray
    card: '26 20% 20%',
    cardForeground: '30 60% 70%',
    cardGlassmorphism: 'transparent',
    buttonRadius: '4px',                // Square buttons
    cardRadius: '4px'
  },

  // FOUR YEARS WAR ERA (2256)
  'ares-mk4-light': {
    background: '40 15% 92%',           // Light warm gray
    foreground: '0 0% 10%',             // Near black text
    primary: '30 85% 50%',              // Warm orange
    primaryGlow: '30 90% 60%',
    secondary: '195 70% 40%',           // Steel blue
    accent: '30 85% 50%',
    lcarsBlur: '0px',
    border: '30 20% 75%',
    card: '40 15% 96%',
    cardForeground: '0 0% 10%',
    cardGlassmorphism: 'transparent',
    muted: '40 10% 85%',
    mutedForeground: '0 0% 35%',
    buttonRadius: '8px',
    cardRadius: '8px'
  },

  'hercules-mk4-dark': {
    background: '220 20% 12%',          // Dark blue-gray (DEFAULT)
    foreground: '30 80% 85%',           // Warm text
    primary: '30 95% 55%',              // Bright orange
    primaryGlow: '30 100% 65%',
    secondary: '195 70% 55%',           // Bright cyan
    accent: '30 95% 55%',
    lcarsBlur: '4px',
    border: '220 15% 25%',
    card: '220 20% 15%',
    cardForeground: '30 80% 85%',
    cardGlassmorphism: '30 95% 55% / 0.03',
    muted: '220 15% 22%',
    mutedForeground: '30 40% 65%',
    buttonRadius: '10px',
    cardRadius: '12px'
  },

  'mark-v-wartime': {
    background: '0 40% 8%',             // Deep red-black
    foreground: '0 100% 90%',           // Bright red-white
    primary: '30 100% 50%',             // Amber alert
    primaryGlow: '0 100% 60%',          // Blood red glow
    secondary: '0 80% 40%',             // Dark red
    accent: '195 80% 60%',              // Emergency cyan
    lcarsBlur: '0px',
    border: '0 50% 30%',
    card: '0 40% 10%',
    cardForeground: '0 100% 90%',
    cardGlassmorphism: '0 100% 30% / 0.04',
    destructive: '0 84% 60%',
    buttonRadius: '6px',
    cardRadius: '8px'
  },

  'klingon-d7': {
    background: '0 50% 8%',             // Deep blood red
    foreground: '30 95% 85%',           // Warm orange-white
    primary: '10 90% 50%',              // Aggressive red-orange
    primaryGlow: '10 100% 60%',
    secondary: '0 80% 35%',             // Dark red
    accent: '30 100% 50%',              // Honor gold
    lcarsBlur: '0px',
    border: '0 60% 25%',
    card: '0 50% 10%',
    cardForeground: '30 95% 85%',
    cardGlassmorphism: 'transparent',
    buttonRadius: '0px',                // Angular Klingon
    cardRadius: '0px'
  },

  // TOS ERA (2265)
  'constitution-2265': {
    background: '220 15% 15%',          // Dark gray-blue
    foreground: '195 80% 80%',          // Light cyan
    primary: '207 90% 54%',             // Primary blue
    primaryGlow: '207 90% 64%',
    secondary: '30 100% 50%',           // Orange accent
    accent: '4 90% 58%',                // Alert red
    lcarsBlur: '0px',
    border: '220 15% 25%',
    card: '220 15% 18%',
    cardForeground: '195 80% 80%',
    cardGlassmorphism: 'transparent',
    buttonRadius: '6px',
    cardRadius: '6px'
  },

  // TMP ERA (2273-2285)
  'tmp-refit-2273': {
    background: '0 0% 0%',              // PURE BLACK - BIRTH OF LCARS
    foreground: '12 100% 80%',          // Orange-red glow
    primary: '12 100% 60%',             // Glowing orange-red #FF4500
    primaryGlow: '25 100% 50%',         // Yellow-orange #FF8C00
    secondary: '195 80% 55%',           // Cool blue-gray
    accent: '12 100% 60%',
    lcarsBlur: '0px',
    border: '12 60% 30%',
    card: '0 0% 5%',
    cardForeground: '12 100% 80%',
    cardGlassmorphism: 'transparent',
    buttonRadius: '999px',              // Full pill buttons
    cardRadius: '24px'
  },

  'excelsior-2285': {
    background: '0 0% 0%',              // Pure black maintained
    foreground: '24 100% 80%',          // Richer orange
    primary: '24 100% 60%',             // True orange #FF6600
    primaryGlow: '30 100% 65%',         // Peach #FFAA77
    secondary: '270 60% 55%',           // First purple hints #9933CC
    accent: '24 100% 60%',
    lcarsBlur: '2px',                   // Subtle blur begins
    border: '24 60% 35%',
    card: '0 0% 5%',
    cardForeground: '24 100% 80%',
    cardGlassmorphism: '24 100% 60% / 0.02',
    buttonRadius: '24px',               // Rounder pills
    cardRadius: '28px'
  },

  // TNG/DS9/VOY ERA (2350-2378)
  'ambassador-2350': {
    background: '260 25% 12%',          // Deep purple-blue
    foreground: '260 60% 85%',          // Light purple
    primary: '260 70% 60%',             // LCARS purple
    primaryGlow: '260 80% 70%',
    secondary: '195 70% 60%',           // Cyan accent
    accent: '260 60% 65%',
    lcarsBlur: '12px',                  // Strong glassmorphism
    border: '260 35% 35%',
    card: '260 25% 12%',
    cardForeground: '260 60% 85%',
    cardGlassmorphism: '260 70% 60% / 0.06',
    buttonRadius: '12px',
    cardRadius: '14px'
  },

  'galaxy-2363': {
    background: '220 15% 15%',          // Dark blue-gray
    foreground: '30 80% 80%',           // Pastel peach
    primary: '30 100% 70%',             // Pastel orange
    primaryGlow: '30 100% 80%',
    secondary: '195 70% 65%',           // Pastel cyan
    accent: '15 90% 70%',               // Pastel peach
    lcarsBlur: '16px',                  // Maximum blur
    border: '30 30% 40%',
    card: '220 15% 15%',
    cardForeground: '30 80% 80%',
    cardGlassmorphism: '30 100% 70% / 0.05',
    buttonRadius: '12px',
    cardRadius: '16px'
  },

  'defiant-2371': {
    background: '260 20% 10%',          // Darker purple-blue
    foreground: '260 50% 80%',          // Light purple
    primary: '260 80% 65%',             // Bright purple
    primaryGlow: '260 90% 75%',
    secondary: '195 70% 60%',           // Cyan
    accent: '280 70% 65%',              // Magenta accent
    lcarsBlur: '14px',
    border: '260 30% 30%',
    card: '260 20% 10%',
    cardForeground: '260 50% 80%',
    cardGlassmorphism: '260 80% 65% / 0.05',
    buttonRadius: '10px',
    cardRadius: '12px'
  },

  'sovereign-2378': {
    background: '220 20% 5%',           // Near black
    foreground: '195 100% 90%',         // Bright cyan
    primary: '195 100% 60%',            // Neon cyan
    primaryGlow: '195 100% 75%',
    secondary: '30 100% 55%',           // Bright orange
    accent: '195 90% 65%',
    lcarsBlur: '0px',                   // Maximum contrast, no blur
    border: '195 50% 35%',
    card: '220 20% 5%',
    cardForeground: '195 100% 90%',
    cardGlassmorphism: 'transparent',
    buttonRadius: '4px',                // Minimalist elbows
    cardRadius: '4px'
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
