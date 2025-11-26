import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { UNIFIED_THEMES, getThemesByCategory } from "@/lib/unified-themes";

export function EraSelector() {
  const { theme, setTheme } = useTheme();
  
  const currentThemeDef = UNIFIED_THEMES.find(t => t.id === theme);

  return (
    <div className="space-y-3">
      {/* Quick Era Selection Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {UNIFIED_THEMES.map((t) => (
          <Button
            key={t.id}
            variant={theme === t.id ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(t.id)}
            className="text-xs font-trek-content justify-start"
          >
            <span className="truncate">{t.shortName}</span>
          </Button>
        ))}
      </div>
      
      {/* Current Theme Info */}
      {currentThemeDef && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold">{currentThemeDef.shortName}</div>
            <div className="text-[10px] mt-1">{currentThemeDef.shipClass}</div>
          </div>
        </div>
      )}
    </div>
  );
}