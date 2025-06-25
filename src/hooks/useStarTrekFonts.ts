
import { useEffect, useState } from 'react';

interface FontFace {
  family: string;
  source: string;
  descriptors?: FontFaceDescriptors;
}

export const useStarTrekFonts = (fonts: FontFace[]) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        let loadedCount = 0;
        const fontPromises = fonts.map(async (font) => {
          const fontFace = new FontFace(font.family, font.source, font.descriptors);
          await fontFace.load();
          document.fonts.add(fontFace);
          loadedCount++;
          setLoadingProgress((loadedCount / fonts.length) * 100);
          return fontFace;
        });

        await Promise.all(fontPromises);
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading Star Trek fonts:', error);
        setFontError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    loadFonts();
  }, [fonts]);

  return { fontsLoaded, fontError, loadingProgress };
};

// Star Trek Font Pack configurations
export const starTrekFonts: FontFace[] = [
  {
    family: 'StarTrek',
    source: 'url("/fonts/startrek/StarTrek.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  },
  {
    family: 'StarTrekFilm',
    source: 'url("/fonts/startrek/StarTrekFilm.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  },
  {
    family: 'StarTrekPi',
    source: 'url("/fonts/startrek/StarTrekPi.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  },
  {
    family: 'StarfleetBoldExtended',
    source: 'url("/fonts/startrek/StarfleetBoldExtended.ttf") format("truetype")',
    descriptors: { weight: '700', style: 'normal' }
  },
  {
    family: 'Venetian301',
    source: 'url("/fonts/startrek/Venetian301.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  },
  {
    family: 'Square721Condensed',
    source: 'url("/fonts/startrek/Square721Condensed.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  }
];
