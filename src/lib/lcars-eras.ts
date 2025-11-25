/**
 * Daystrom Design System - LCARS Evolution Timeline
 * 2245 → 2378 (155 years of Starfleet interface design)
 */

export type LCARSEra = 
  | 'mark-iv-2245'      // Daystrom Mark IV - Pre-LCARS hard glass
  | 'mark-v-wartime'    // Mark V Wartime Emergency (2256-2260)
  | 'block-i-2265'      // LCARS Block I - First soft surfaces
  | 'block-ii-2278'     // LCARS Block II - TOS Movie rainbow
  | 'block-iii-2288'    // LCARS Block III - Excelsior era
  | 'block-iv-2350'     // LCARS Block IV - Ambassador purple
  | 'block-v-2363'      // LCARS Block V - Early TNG Galaxy
  | 'block-vi-2371'     // LCARS Block VI - Mid TNG
  | 'block-vii-2378';   // LCARS Block VII - Voyager/DS9

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
    id: 'mark-iv-2245',
    year: '2245',
    name: 'Daystrom Mark IV',
    shortName: 'Mark IV',
    description: 'Hard black glass panels, physical buttons, ice-blue/orange bars',
    shipClass: 'NX, Daedalus, Ares',
    visualSignature: ['Hard black glass', 'Ice-blue/orange bars', 'OCR-A typography', 'No blur'],
    cssClass: 'era-mark-iv'
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
    id: 'block-i-2265',
    year: '2265',
    name: 'LCARS Block I',
    shortName: 'Block I',
    description: 'First soft translucency, pastel elbows, rounded rectangles',
    shipClass: 'Constitution (Original)',
    visualSignature: ['Soft translucency', 'Pastel elbows', 'Subtle blur begins', 'Touch surfaces'],
    cssClass: 'era-block-i'
  },
  {
    id: 'block-ii-2278',
    year: '2278',
    name: 'LCARS Block II (TOS Movie)',
    shortName: 'Block II',
    description: 'Famous rainbow palette, thick bezels, animated caution stripes',
    shipClass: 'Constitution-Refit, Miranda',
    visualSignature: ['Rainbow palette', 'Thick orange/cyan bezels', 'Barber-pole alerts', 'Microgramma Bold'],
    cssClass: 'era-block-ii'
  },
  {
    id: 'block-iii-2288',
    year: '2288',
    name: 'LCARS Block III (Excelsior)',
    shortName: 'Block III',
    description: 'Black-background Okuda-grams, hard 45° elbows, amber dominant',
    shipClass: 'Excelsior, Constellation',
    visualSignature: ['Black Okuda-grams', '45° hard elbows', 'Amber alerts', 'Library computer access'],
    cssClass: 'era-block-iii'
  },
  {
    id: 'block-iv-2350',
    year: '2350',
    name: 'LCARS Block IV (Ambassador)',
    shortName: 'Block IV',
    description: 'Soft purple/blue gradients, strong glassmorphism, variable opacity',
    shipClass: 'Ambassador, New Orleans',
    visualSignature: ['Purple/blue gradients', 'Strong glassmorphism', 'Variable opacity', 'Golden age'],
    cssClass: 'era-block-iv'
  },
  {
    id: 'block-v-2363',
    year: '2363',
    name: 'LCARS Block V (Galaxy)',
    shortName: 'Block V',
    description: 'Pastel peach/cyan/orange, maximum blur, soft rounded rectangles',
    shipClass: 'Galaxy (Enterprise-D Launch)',
    visualSignature: ['Pastel peaches', 'Maximum blur', 'Pool table bridge', 'Picard\'s favorite'],
    cssClass: 'era-block-v'
  },
  {
    id: 'block-vi-2371',
    year: '2371',
    name: 'LCARS Block VI (Mid TNG)',
    shortName: 'Block VI',
    description: 'Darker backgrounds, more purple accents, captain\'s yacht purple',
    shipClass: 'Galaxy, Nebula, Early Intrepid',
    visualSignature: ['Darker backgrounds', 'Purple accents', 'Refined TNG', 'Seasons 3-7'],
    cssClass: 'era-block-vi'
  },
  {
    id: 'block-vii-2378',
    year: '2378',
    name: 'LCARS Block VII (Voyager)',
    shortName: 'Block VII',
    description: 'Pure black, bright cyan/orange, minimalist elbows, maximum contrast',
    shipClass: 'Intrepid, Defiant, Sovereign',
    visualSignature: ['Pure black', 'Neon cyan/orange', 'Minimal elbows', 'Maximum contrast'],
    cssClass: 'era-block-vii'
  }
];

export const DEFAULT_ERA: LCARSEra = 'mark-iv-2245';

export function getEraByYear(year: string): EraDefinition | undefined {
  return LCARS_ERAS.find(era => era.year === year);
}

export function getEraById(id: LCARSEra): EraDefinition | undefined {
  return LCARS_ERAS.find(era => era.id === id);
}
