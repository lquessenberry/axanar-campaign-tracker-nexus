
import { useEffect, useState } from 'react';

interface FontFace {
  family: string;
  source: string;
  descriptors?: FontFaceDescriptors;
}

export const useFontLoader = (fonts: FontFace[]) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontPromises = fonts.map(async (font) => {
          const fontFace = new FontFace(font.family, font.source, font.descriptors);
          await fontFace.load();
          document.fonts.add(fontFace);
          return fontFace;
        });

        await Promise.all(fontPromises);
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    loadFonts();
  }, [fonts]);

  return { fontsLoaded, fontError };
};

// Predefined font configurations
export const customFonts: FontFace[] = [
  {
    family: 'CustomFont',
    source: 'url("/fonts/CustomFont-Regular.ttf") format("truetype")',
    descriptors: { weight: '400', style: 'normal' }
  },
  {
    family: 'CustomFont',
    source: 'url("/fonts/CustomFont-Bold.ttf") format("truetype")',
    descriptors: { weight: '700', style: 'normal' }
  },
  {
    family: 'CustomFont',
    source: 'url("/fonts/CustomFont-Light.ttf") format("truetype")',
    descriptors: { weight: '300', style: 'normal' }
  }
];
