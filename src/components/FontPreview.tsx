
import { useFontLoader, customFonts } from '@/hooks/useFontLoader';

const FontPreview = () => {
  const { fontsLoaded, fontError } = useFontLoader(customFonts);

  if (fontError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading fonts: {fontError}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure your TTF files are placed in the public/fonts/ directory
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Font Preview</h3>
        {fontsLoaded ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            Loaded
          </span>
        ) : (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
            Loading...
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Default Sans (Inter)</h4>
          <p className="font-sans text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Display Font (Orbitron)</h4>
          <p className="font-display text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Font - Light (300)</h4>
          <p className="font-custom font-light text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Font - Regular (400)</h4>
          <p className="font-custom font-normal text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Font - Bold (700)</h4>
          <p className="font-custom font-bold text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="text-sm font-semibold mb-2">Usage Examples:</h4>
        <code className="text-xs text-gray-600 block space-y-1">
          <div>&lt;div className="font-custom font-light"&gt;Light text&lt;/div&gt;</div>
          <div>&lt;div className="font-custom font-normal"&gt;Regular text&lt;/div&gt;</div>
          <div>&lt;div className="font-custom font-bold"&gt;Bold text&lt;/div&gt;</div>
        </code>
      </div>
    </div>
  );
};

export default FontPreview;
