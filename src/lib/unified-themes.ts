/**
 * Unified Theme System
 * Merges theme modes and LCARS eras into single comprehensive themes
 */

export type UnifiedTheme = 
  // Pre-Federation (2151)
  | 'nx-2151'
  
  // Four Years War (2256-2260)
  | 'ares-mk4-light'      // Light mode - Ares Mark IV
  | 'hercules-mk4-dark'   // Dark mode - Hercules Mark IV (DEFAULT)
  | 'mark-v-wartime'      // Tactical/Wartime mode
  | 'klingon-d7'          // Klingon D7 with Klingon fonts
  
  // TOS Era (2265)
  | 'constitution-2265'
  
  // TMP Era (2273-2285)
  | 'tmp-refit-2273'
  | 'excelsior-2285'
  
  // TNG/DS9/VOY Era (2350-2378)
  | 'ambassador-2350'
  | 'galaxy-2363'
  | 'defiant-2371'
  | 'sovereign-2378';

export interface ThemeDefinition {
  id: UnifiedTheme;
  name: string;
  shortName: string;
  description: string;
  era: string;
  year: string;
  shipClass: string;
  visualSignature: string[];
  cssClass: string;
  icon: 'sun' | 'moon' | 'zap' | 'sword' | 'ship' | 'rocket';
  category: 'pre-federation' | 'four-years-war' | 'tos' | 'tmp' | 'tng-era';
}

export const UNIFIED_THEMES: ThemeDefinition[] = [
  // Pre-Federation
  {
    id: 'nx-2151',
    name: 'NX-Class Proto-LCARS',
    shortName: 'NX-2151',
    description: 'Cold steely gray-blue metallic, square buttons, submarine aesthetic',
    era: 'Pre-Federation',
    year: '2151',
    shipClass: 'Enterprise NX-01',
    visualSignature: ['Gray-blue metallic', 'Square buttons', 'Dull orange accents', 'OCR-A font'],
    cssClass: 'theme-nx-2151',
    icon: 'rocket',
    category: 'pre-federation'
  },
  
  // Four Years War
  {
    id: 'ares-mk4-light',
    name: 'Ares Mark IV (Light)',
    shortName: 'Ares Mk4',
    description: 'Light operations mode with Daystrom Mark IV interface',
    era: 'Four Years War',
    year: '2256',
    shipClass: 'Ares-class Daedalus',
    visualSignature: ['Light background', 'High contrast', 'Clear readability', 'Tactical efficiency'],
    cssClass: 'theme-ares-mk4-light',
    icon: 'sun',
    category: 'four-years-war'
  },
  {
    id: 'hercules-mk4-dark',
    name: 'Hercules Mark IV (Dark)',
    shortName: 'Hercules Mk4',
    description: 'Dark operations mode - default Daystrom interface',
    era: 'Four Years War',
    year: '2256',
    shipClass: 'Hercules-class Heavy Cruiser',
    visualSignature: ['Dark background', 'Reduced glare', 'Night operations', 'Command standard'],
    cssClass: 'theme-hercules-mk4-dark',
    icon: 'moon',
    category: 'four-years-war'
  },
  {
    id: 'mark-v-wartime',
    name: 'Daystrom Mark V (Wartime)',
    shortName: 'Mark V Tactical',
    description: 'Emergency wartime overlay - blood-red alerts, battle damage effects',
    era: 'Four Years War',
    year: '2256',
    shipClass: 'Legacy Daedalus/Ares',
    visualSignature: ['Blood-red underglow', 'Pulsing amber alerts', 'Scanline damage', 'Combat ready'],
    cssClass: 'theme-mark-v-wartime',
    icon: 'zap',
    category: 'four-years-war'
  },
  {
    id: 'klingon-d7',
    name: 'Klingon D7 Battle Cruiser',
    shortName: 'D7 Klingon',
    description: 'Klingon Empire interface with authentic Klingon display fonts',
    era: 'Four Years War',
    year: '2256',
    shipClass: 'D7 Battle Cruiser',
    visualSignature: ['Deep red/orange', 'Aggressive angles', 'Klingon pIqaD', 'Honor & Glory'],
    cssClass: 'theme-klingon-d7',
    icon: 'sword',
    category: 'four-years-war'
  },
  
  // TOS Era
  {
    id: 'constitution-2265',
    name: 'Constitution-Class Original',
    shortName: 'TOS Constitution',
    description: 'Primary colors, blocky sans-serif, first hint of LCARS',
    era: 'TOS Era',
    year: '2265',
    shipClass: 'Constitution (Original)',
    visualSignature: ['Primary colors', 'Blocky buttons', 'Orange sliding bars', 'Classic Trek'],
    cssClass: 'theme-constitution-2265',
    icon: 'ship',
    category: 'tos'
  },
  
  // TMP Era
  {
    id: 'tmp-refit-2273',
    name: 'Constitution Refit - BIRTH OF LCARS',
    shortName: 'TMP Refit',
    description: 'Pure black background, glowing orange-red wedges, first pill buttons',
    era: 'TMP Era',
    year: '2273',
    shipClass: 'Constitution-Refit',
    visualSignature: ['Pure black', 'Orange-red wedge', 'First pills', 'LCARS birth'],
    cssClass: 'theme-tmp-refit-2273',
    icon: 'ship',
    category: 'tmp'
  },
  {
    id: 'excelsior-2285',
    name: 'Excelsior-Class Evolution',
    shortName: 'Excelsior',
    description: 'Richer orange, L-shaped bars, first purple hints',
    era: 'TMP Era',
    year: '2285',
    shipClass: 'Excelsior, Enterprise-A',
    visualSignature: ['Richer orange', 'L-shaped frames', 'First purple', 'Rounded pills'],
    cssClass: 'theme-excelsior-2285',
    icon: 'ship',
    category: 'tmp'
  },
  
  // TNG/DS9/VOY Era
  {
    id: 'ambassador-2350',
    name: 'LCARS Block IV (Ambassador)',
    shortName: 'Ambassador',
    description: 'Soft purple/blue gradients, strong glassmorphism',
    era: 'TNG Era',
    year: '2350',
    shipClass: 'Ambassador-class',
    visualSignature: ['Purple/blue gradients', 'Strong glassmorphism', 'Variable opacity'],
    cssClass: 'theme-ambassador-2350',
    icon: 'ship',
    category: 'tng-era'
  },
  {
    id: 'galaxy-2363',
    name: 'LCARS Block V (Galaxy)',
    shortName: 'Galaxy',
    description: 'Pastel peach/cyan/orange, maximum blur, soft rounded rectangles',
    era: 'TNG Era',
    year: '2363',
    shipClass: 'Galaxy-class',
    visualSignature: ['Pastel peaches', 'Maximum blur', 'Pool table bridge'],
    cssClass: 'theme-galaxy-2363',
    icon: 'ship',
    category: 'tng-era'
  },
  {
    id: 'defiant-2371',
    name: 'LCARS Block VI (Defiant)',
    shortName: 'Defiant',
    description: 'Darker backgrounds, more purple accents, refined aesthetic',
    era: 'TNG Era',
    year: '2371',
    shipClass: 'Defiant-class',
    visualSignature: ['Darker backgrounds', 'Purple accents', 'Refined TNG'],
    cssClass: 'theme-defiant-2371',
    icon: 'ship',
    category: 'tng-era'
  },
  {
    id: 'sovereign-2378',
    name: 'LCARS Block VII (Sovereign)',
    shortName: 'Sovereign',
    description: 'Pure black, bright cyan/orange, minimalist elbows, maximum contrast',
    era: 'TNG Era',
    year: '2378',
    shipClass: 'Sovereign-class',
    visualSignature: ['Pure black', 'Neon cyan/orange', 'Minimal elbows'],
    cssClass: 'theme-sovereign-2378',
    icon: 'ship',
    category: 'tng-era'
  }
];

export const DEFAULT_THEME: UnifiedTheme = 'hercules-mk4-dark';

export function getThemeById(id: UnifiedTheme): ThemeDefinition | undefined {
  return UNIFIED_THEMES.find(theme => theme.id === id);
}

export function getThemesByCategory(category: ThemeDefinition['category']): ThemeDefinition[] {
  return UNIFIED_THEMES.filter(theme => theme.category === category);
}