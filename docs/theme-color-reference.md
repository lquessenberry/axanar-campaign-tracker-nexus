# Unified Theme Color Token Reference

Complete color system documentation for all Daystrom interface themes across 227 years of Starfleet design (2151 → 2378).

## Theme Structure

Each theme contains the following color tokens:
- **background**: Main background color
- **foreground**: Primary text color
- **primary**: Primary UI color (buttons, highlights)
- **primaryGlow**: Brighter variant for glows/hover states
- **secondary**: Secondary UI elements
- **accent**: Accent highlights
- **lcarsBlur**: Backdrop blur amount (0px to 16px)
- **border**: Border color
- **card**: Card background
- **cardForeground**: Card text color
- **cardGlassmorphism**: Glassmorphism overlay color
- **buttonRadius**: Button border radius
- **cardRadius**: Card border radius

---

## Pre-Federation Era (2151)

### NX-2151 (Enterprise NX-01)
**Ship Class**: Enterprise NX-01, Columbia NX-02  
**Visual Signature**: Gray-blue metallic, square buttons, submarine aesthetic

```css
--background: 26 20% 18%        /* Gray-blue metallic */
--foreground: 30 60% 70%        /* Dull orange */
--primary: 45 40% 60%           /* Pale yellow */
--primary-glow: 30 60% 65%
--secondary: 30 60% 60%         /* Dull orange */
--accent: 195 40% 50%           /* Steel blue */
--lcars-blur: 0px               /* NO BLUR - hard edges */
--border: 0 0% 30%              /* Dark gray */
--card: 26 20% 20%
--button-radius: 4px            /* Square buttons */
--card-radius: 4px
```

---

## Four Years War Era (2256)

### Ares Mark IV (Light Mode)
**Ship Class**: Ares-class Daedalus  
**Visual Signature**: Light operations, high contrast, clear readability

```css
--background: 40 15% 92%        /* Light warm gray */
--foreground: 0 0% 10%          /* Near black text */
--primary: 30 85% 50%           /* Warm orange */
--primary-glow: 30 90% 60%
--secondary: 195 70% 40%        /* Steel blue */
--accent: 30 85% 50%
--lcars-blur: 0px
--border: 30 20% 75%
--card: 40 15% 96%
--muted: 40 10% 85%
--muted-foreground: 0 0% 35%
--button-radius: 8px
--card-radius: 8px
```

### Hercules Mark IV (Dark Mode) **[DEFAULT]**
**Ship Class**: Hercules-class Heavy Cruiser  
**Visual Signature**: Dark operations, reduced glare, command standard

```css
--background: 220 20% 12%       /* Dark blue-gray */
--foreground: 30 80% 85%        /* Warm text */
--primary: 30 95% 55%           /* Bright orange */
--primary-glow: 30 100% 65%
--secondary: 195 70% 55%        /* Bright cyan */
--accent: 30 95% 55%
--lcars-blur: 4px
--border: 220 15% 25%
--card: 220 20% 15%
--muted: 220 15% 22%
--muted-foreground: 30 40% 65%
--button-radius: 10px
--card-radius: 12px
```

### Mark V Wartime (Tactical)
**Ship Class**: Legacy Daedalus/Ares  
**Visual Signature**: Blood-red alerts, pulsing amber, scanline damage, combat ready

```css
--background: 0 40% 8%          /* Deep red-black */
--foreground: 0 100% 90%        /* Bright red-white */
--primary: 30 100% 50%          /* Amber alert */
--primary-glow: 0 100% 60%      /* Blood red glow */
--secondary: 0 80% 40%          /* Dark red */
--accent: 195 80% 60%           /* Emergency cyan */
--destructive: 0 84% 60%
--lcars-blur: 0px
--border: 0 50% 30%
--card: 0 40% 10%
--button-radius: 6px
--card-radius: 8px
```

**Special Effects**:
- Blood red underglow animation
- Pulsing alert edges
- Scanline damage overlay
- Red alert badge glow

### Klingon D7 Battle Cruiser
**Ship Class**: D7 Battle Cruiser  
**Visual Signature**: Deep red/orange, aggressive angles, Klingon pIqaD fonts

```css
--background: 0 50% 8%          /* Deep blood red */
--foreground: 30 95% 85%        /* Warm orange-white */
--primary: 10 90% 50%           /* Aggressive red-orange */
--primary-glow: 10 100% 60%
--secondary: 0 80% 35%          /* Dark red */
--accent: 30 100% 50%           /* Honor gold */
--lcars-blur: 0px
--border: 0 60% 25%
--card: 0 50% 10%
--button-radius: 0px            /* Angular Klingon design */
--card-radius: 0px
```

**Special Features**:
- Angular clip-path geometry
- Klingon pIqaD font for headings
- Honor & Glory color scheme

---

## TOS Era (2265)

### Constitution-2265 (TOS TV)
**Ship Class**: Constitution (Original)  
**Visual Signature**: Primary colors, blocky buttons, orange sliding bars

```css
--background: 220 15% 15%       /* Dark gray-blue */
--foreground: 195 80% 80%       /* Light cyan */
--primary: 207 90% 54%          /* Primary blue */
--primary-glow: 207 90% 64%
--secondary: 30 100% 50%        /* Orange accent */
--accent: 4 90% 58%             /* Alert red */
--lcars-blur: 0px
--border: 220 15% 25%
--card: 220 15% 18%
--button-radius: 6px
--card-radius: 6px
```

---

## TMP Era (2273-2285)

### TMP-Refit-2273 (BIRTH OF LCARS)
**Ship Class**: Constitution-Refit, Miranda  
**Visual Signature**: Pure black, orange-red wedges, first pill buttons

```css
--background: 0 0% 0%           /* PURE BLACK - first time! */
--foreground: 12 100% 80%       /* Orange-red glow */
--primary: 12 100% 60%          /* Glowing orange-red #FF4500 */
--primary-glow: 25 100% 50%     /* Yellow-orange #FF8C00 */
--secondary: 195 80% 55%        /* Cool blue-gray */
--accent: 12 100% 60%
--lcars-blur: 0px
--border: 12 60% 30%
--card: 0 0% 5%
--button-radius: 999px          /* Full pill buttons */
--card-radius: 24px
```

**Milestone**: This is the birth moment of LCARS. Robert Abel's team created the iconic shoulder wedge and glowing orange aesthetics.

### Excelsior-2285
**Ship Class**: Excelsior, Enterprise-A  
**Visual Signature**: Richer orange, L-shaped frames, first purple hints

```css
--background: 0 0% 0%           /* Pure black maintained */
--foreground: 24 100% 80%       /* Richer orange */
--primary: 24 100% 60%          /* True orange #FF6600 */
--primary-glow: 30 100% 65%     /* Peach #FFAA77 */
--secondary: 270 60% 55%        /* First purple hints #9933CC */
--accent: 24 100% 60%
--lcars-blur: 2px               /* Subtle blur begins */
--border: 24 60% 35%
--card: 0 0% 5%
--button-radius: 24px           /* Rounder pills */
--card-radius: 28px
```

---

## TNG/DS9/VOY Era (2350-2378)

### Ambassador-2350 (LCARS Block IV)
**Ship Class**: Ambassador, New Orleans  
**Visual Signature**: Purple/blue gradients, strong glassmorphism

```css
--background: 260 25% 12%       /* Deep purple-blue */
--foreground: 260 60% 85%       /* Light purple */
--primary: 260 70% 60%          /* LCARS purple */
--primary-glow: 260 80% 70%
--secondary: 195 70% 60%        /* Cyan accent */
--accent: 260 60% 65%
--lcars-blur: 12px              /* Strong glassmorphism */
--border: 260 35% 35%
--card: 260 25% 12%
--button-radius: 12px
--card-radius: 14px
```

### Galaxy-2363 (LCARS Block V)
**Ship Class**: Galaxy (Enterprise-D Launch)  
**Visual Signature**: Pastel peach/cyan, maximum blur, soft rounded rectangles

```css
--background: 220 15% 15%       /* Dark blue-gray */
--foreground: 30 80% 80%        /* Pastel peach */
--primary: 30 100% 70%          /* Pastel orange */
--primary-glow: 30 100% 80%
--secondary: 195 70% 65%        /* Pastel cyan */
--accent: 15 90% 70%            /* Pastel peach */
--lcars-blur: 16px              /* Maximum blur */
--border: 30 30% 40%
--card: 220 15% 15%
--button-radius: 12px
--card-radius: 16px
```

**Era Note**: Peak TNG aesthetic. The "pool table bridge" look.

### Defiant-2371 (LCARS Block VI)
**Ship Class**: Defiant, Nebula, Early Intrepid  
**Visual Signature**: Darker backgrounds, purple accents, refined TNG

```css
--background: 260 20% 10%       /* Darker purple-blue */
--foreground: 260 50% 80%       /* Light purple */
--primary: 260 80% 65%          /* Bright purple */
--primary-glow: 260 90% 75%
--secondary: 195 70% 60%        /* Cyan */
--accent: 280 70% 65%           /* Magenta accent */
--lcars-blur: 14px
--border: 260 30% 30%
--card: 260 20% 10%
--button-radius: 10px
--card-radius: 12px
```

### Sovereign-2378 (LCARS Block VII)
**Ship Class**: Sovereign, Intrepid, Defiant  
**Visual Signature**: Pure black, neon cyan/orange, minimalist elbows, maximum contrast

```css
--background: 220 20% 5%        /* Near black */
--foreground: 195 100% 90%      /* Bright cyan */
--primary: 195 100% 60%         /* Neon cyan */
--primary-glow: 195 100% 75%
--secondary: 30 100% 55%        /* Bright orange */
--accent: 195 90% 65%
--lcars-blur: 0px               /* Maximum contrast, no blur */
--border: 195 50% 35%
--card: 220 20% 5%
--button-radius: 4px            /* Minimalist elbows */
--card-radius: 4px
```

**Era Note**: Final evolution. Voyager's astrometrics lab is the peak expression of this aesthetic.

---

## Usage in Code

### TypeScript/React
```typescript
import { getThemeColors, hslToken } from '@/lib/theme-colors';

const colors = getThemeColors('hercules-mk4-dark');
const bgColor = hslToken(colors.background);
const primaryWithOpacity = hslToken(colors.primary, 0.5);
```

### CSS Custom Properties
```css
.my-component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
```

---

## Historical Context

### The Archaeological Record

This color system represents 227 years of canonical Starfleet interface design evolution:

1. **2151 (NX-Class)**: Submarine control rooms, gray-blue metallic, practical engineering
2. **2256 (Four Years War)**: Emergency wartime systems, tactical alerts, Klingon interfaces
3. **2265 (TOS TV)**: Primary colors, first hints of LCARS orange bars
4. **2273 (TMP)**: **BIRTH OF LCARS** - Pure black backgrounds, glowing orange wedges, pill buttons
5. **2285 (Excelsior)**: Richer orange, L-shaped frames, first purple hints, rounder pills
6. **2350-2378 (TNG Era)**: Full LCARS maturity - glassmorphism, pastels, purple dominance, maximum contrast

Every color transition, every blur radius increase, every button shape evolution - it all has historical precedent in Star Trek's visual canon.

---

## Color Philosophy

- **Pre-Federation**: Cold, metallic, utilitarian. No unnecessary flourishes.
- **Four Years War**: Tactical efficiency. Light/dark operational modes. Emergency combat overlays.
- **TOS**: Bold primary colors. Function over form. Optimistic 23rd century.
- **TMP**: The great leap. Pure black as canvas. Orange as light source.
- **TNG Era**: Glassmorphism, transparency, depth. Interface as art form.

---

*Steve Jobs and Michael Okuda just high-fived across time. 🖖🚀*
