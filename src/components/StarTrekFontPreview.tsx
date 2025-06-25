
import { useStarTrekFonts, starTrekFonts } from '@/hooks/useStarTrekFonts';
import { Progress } from '@/components/ui/progress';

const StarTrekFontPreview = () => {
  const { fontsLoaded, fontError, loadingProgress } = useStarTrekFonts(starTrekFonts);

  if (fontError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading Star Trek fonts: {fontError}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure your Star Trek TTF files are placed in the public/fonts/startrek/ directory
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-b from-axanar-dark to-black text-white rounded-lg border border-axanar-teal/30">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-display text-axanar-teal">Star Trek Font Preview</h3>
        {!fontsLoaded && (
          <div className="flex items-center gap-2 flex-1">
            <Progress value={loadingProgress} className="max-w-xs" />
            <span className="text-sm text-axanar-silver">Loading {Math.round(loadingProgress)}%</span>
          </div>
        )}
        {fontsLoaded && (
          <span className="px-3 py-1 bg-green-900/50 text-green-300 text-sm rounded border border-green-500/30">
            All Fonts Loaded
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Original Series Font */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Star Trek Original Series</h4>
          <p className="font-startrek text-2xl text-axanar-silver">
            AXANAR PRODUCTIONS
          </p>
          <p className="font-startrek text-lg">
            The Final Frontier Awaits
          </p>
          <code className="text-xs text-gray-400">font-startrek</code>
        </div>

        {/* Film Font */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Star Trek Film Titles</h4>
          <p className="font-startrek-film text-2xl text-axanar-silver">
            AXANAR PRODUCTIONS
          </p>
          <p className="font-startrek-film text-lg">
            Beyond the Stars
          </p>
          <code className="text-xs text-gray-400">font-startrek-film</code>
        </div>

        {/* Starfleet Font */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Starfleet Vessels</h4>
          <p className="font-starfleet text-2xl text-axanar-silver">
            USS ARES
          </p>
          <p className="font-starfleet text-lg">
            NCC-1650
          </p>
          <code className="text-xs text-gray-400">font-starfleet</code>
        </div>

        {/* Symbols Font */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Star Trek Symbols</h4>
          <p className="font-startrek-pi text-3xl text-axanar-silver">
            ABCDEFGH
          </p>
          <p className="text-sm text-gray-300">
            Starfleet insignias and Klingon symbols
          </p>
          <code className="text-xs text-gray-400">font-startrek-pi</code>
        </div>

        {/* Venetian Text */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Venetian 301 (Body Text)</h4>
          <p className="font-venetian text-lg text-axanar-silver">
            Four years ago, the Federation and the Klingon Empire fought their bloodiest battle at Axanar.
          </p>
          <code className="text-xs text-gray-400">font-venetian</code>
        </div>

        {/* Square Condensed */}
        <div className="space-y-3 p-4 bg-black/30 rounded border border-axanar-teal/20">
          <h4 className="text-sm font-semibold text-axanar-teal uppercase tracking-wider">Square 721 Condensed</h4>
          <p className="font-square text-xl text-axanar-silver uppercase tracking-wider">
            TACTICAL DISPLAY
          </p>
          <p className="font-square text-base text-axanar-silver">
            Systems Operational
          </p>
          <code className="text-xs text-gray-400">font-square</code>
        </div>
      </div>

      <div className="mt-8 p-4 bg-axanar-dark/50 rounded border border-axanar-teal/30">
        <h4 className="text-sm font-semibold mb-3 text-axanar-teal">Typography Guidelines:</h4>
        <div className="grid gap-2 text-xs text-gray-300">
          <div><strong className="text-axanar-silver">StarTrek:</strong> Use for main titles and branding</div>
          <div><strong className="text-axanar-silver">StarTrekFilm:</strong> Use for movie-style headings</div>
          <div><strong className="text-axanar-silver">Starfleet:</strong> Use for ship names and official designations</div>
          <div><strong className="text-axanar-silver">StarTrekPi:</strong> Use sparingly for special symbols</div>
          <div><strong className="text-axanar-silver">Venetian301:</strong> Use for readable body text</div>
          <div><strong className="text-axanar-silver">Square721:</strong> Use for technical/computer interfaces</div>
        </div>
      </div>
    </div>
  );
};

export default StarTrekFontPreview;
