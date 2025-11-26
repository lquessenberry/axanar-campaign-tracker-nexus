/**
 * Daystrom Design System - LCARS Evolution Timeline
 * 2245 → 2378 (155 years of Starfleet interface design)
 */

export type LCARSEra = 
  // Proto-LCARS (Pre-TNG Evolution)
  | 'nx-2151'           // ENT NX-class - Gray-blue metallic, square buttons
  | 'constitution-2265' // TOS TV - Primary colors, blocky, first hints
  | 'tmp-refit-2273'    // TMP - BIRTH OF LCARS - pure black, orange wedges, first pills
  | 'excelsior-2285'    // TWOK-TUC - Richer orange, L-shapes, first purple
  | 'mark-v-wartime'    // Mark V Wartime Emergency (2256-2260)
  
  // LCARS Proper (TNG Era Forward)
  | 'ambassador-2350'   // LCARS Block IV - Ambassador purple transition
  | 'galaxy-2363'       // LCARS Block V - Early TNG pastels
  | 'defiant-2371'      // LCARS Block VI - DS9/VOY minimalist
  | 'sovereign-2378';   // LCARS Block VII - Nemesis-era refined

export interface EraDefinition {
  id: LCARSEra;
  year: string;
  name: string;
  shortName: string;
  description: string;
  shipClass: string;
  visualSignature: string[];
  cssClass: string;
}

export const LCARS_ERAS: EraDefinition[] = [
  {
    id: 'nx-2151',
    year: '2151',
    name: 'NX-Class Proto-LCARS',
    shortName: 'NX-2151',
    description: 'Cold steely gray-blue metallic, square buttons with small corners, submarine control room aesthetic',
    shipClass: 'Enterprise NX-01, Columbia NX-02',
    visualSignature: ['Gray-blue metallic', 'Square buttons', 'Dull orange accents', 'Thin grid lines', 'No blur', 'OCR-A font'],
    cssClass: 'era-nx-2151'
  },
  {
    id: 'constitution-2265',
    year: '2265',
    name: 'Constitution-Class Original',
    shortName: 'TOS-2265',
    description: 'Primary colors, blocky sans-serif, first hint of orange highlight bars',
    shipClass: 'Constitution (Original)',
    visualSignature: ['Primary colors', 'Blocky buttons', 'Small text', 'Orange sliding bars', 'Practical workstation'],
    cssClass: 'era-constitution-2265'
  },
  {
    id: 'tmp-refit-2273',
    year: '2273',
    name: 'Constitution Refit - BIRTH OF LCARS',
    shortName: 'TMP-2273',
    description: 'PURE BLACK background debuts! Glowing orange-red wedges, first true pill buttons',
    shipClass: 'Constitution-Refit, Miranda',
    visualSignature: ['Pure black debut', 'Orange-red shoulder wedge', 'First pill buttons', 'Glowing accents', 'Horizontal crawling bars'],
    cssClass: 'era-tmp-refit-2273'
  },
  {
    id: 'excelsior-2285',
    year: '2285',
    name: 'Excelsior-Class Evolution',
    shortName: 'Excelsior-2285',
    description: 'Richer true orange, clear L-shaped bars, first purple-magenta hints, taller stretched font',
    shipClass: 'Excelsior, Enterprise-A',
    visualSignature: ['Richer orange', 'L-shaped frames', 'First purple hints', 'Rounder pills', 'Faster animations', 'Stretched letters'],
    cssClass: 'era-excelsior-2285'
  },
  {
    id: 'mark-v-wartime',
    year: '2256',
    name: 'Daystrom Mark V (Wartime)',
    shortName: 'Mark V War',
    description: 'Emergency wartime overlay - blood-red alerts, battle damage effects',
    shipClass: 'Legacy Daedalus/Ares (Four Years War)',
    visualSignature: ['Blood-red underglow', 'Pulsing amber alerts', 'Scanline damage', 'Combat ready'],
    cssClass: 'era-mark-v-war'
  },
  {
    id: 'ambassador-2350',
    year: '2350',
    name: 'LCARS Block IV (Ambassador)',
    shortName: 'Ambassador-2350',
    description: 'Soft purple/blue gradients, strong glassmorphism, variable opacity transition',
    shipClass: 'Ambassador, New Orleans',
    visualSignature: ['Purple/blue gradients', 'Strong glassmorphism', 'Variable opacity', 'Golden age'],
    cssClass: 'era-ambassador-2350'
  },
  {
    id: 'galaxy-2363',
    year: '2363',
    name: 'LCARS Block V (Galaxy)',
    shortName: 'Galaxy-2363',
    description: 'Pastel peach/cyan/orange, maximum blur, soft rounded rectangles',
    shipClass: 'Galaxy (Enterprise-D Launch)',
    visualSignature: ['Pastel peaches', 'Maximum blur', 'Pool table bridge', 'Picard\'s favorite'],
    cssClass: 'era-galaxy-2363'
  },
  {
    id: 'defiant-2371',
    year: '2371',
    name: 'LCARS Block VI (Mid TNG)',
    shortName: 'Defiant-2371',
    description: 'Darker backgrounds, more purple accents, refined TNG aesthetic',
    shipClass: 'Defiant, Nebula, Early Intrepid',
    visualSignature: ['Darker backgrounds', 'Purple accents', 'Refined TNG', 'Seasons 3-7'],
    cssClass: 'era-defiant-2371'
  },
  {
    id: 'sovereign-2378',
    year: '2378',
    name: 'LCARS Block VII (Sovereign)',
    shortName: 'Sovereign-2378',
    description: 'Pure black, bright cyan/orange, minimalist elbows, maximum contrast',
    shipClass: 'Sovereign, Intrepid, Defiant',
    visualSignature: ['Pure black', 'Neon cyan/orange', 'Minimal elbows', 'Maximum contrast'],
    cssClass: 'era-sovereign-2378'
  }
];

export const DEFAULT_ERA: LCARSEra = 'nx-2151';

export function getEraByYear(year: string): EraDefinition | undefined {
  return LCARS_ERAS.find(era => era.year === year);
}

export function getEraById(id: LCARSEra): EraDefinition | undefined {
  return LCARS_ERAS.find(era => era.id === id);
}
