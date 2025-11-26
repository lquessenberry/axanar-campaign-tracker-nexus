import { useTheme } from '@/contexts/ThemeContext';
import { LCARS_ERAS } from '@/lib/lcars-eras';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EraSelector() {
  const { era, setEra } = useTheme();
  
  const currentEra = LCARS_ERAS.find(e => e.id === era);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {LCARS_ERAS.map((eraItem) => {
          const isActive = era === eraItem.id;
          const isTMP = eraItem.id === 'tmp-refit-2273';
          const isExcelsior = eraItem.id === 'excelsior-2285';
          
          return (
            <Button
              key={eraItem.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setEra(eraItem.id)}
              className={cn(
                "text-xs font-mono h-9 px-2 relative overflow-hidden transition-all",
                isActive && "bg-primary text-primary-foreground ring-2 ring-primary/50"
              )}
            >
              {/* Era-specific visual hints */}
              {isTMP && isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/20 to-[#FF8C00]/20 animate-pulse" />
              )}
              {isExcelsior && isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/20 to-[#9933CC]/10 animate-pulse" />
              )}
              
              <span className="relative z-10 flex items-center gap-1">
                {eraItem.year}
                {eraItem.id === 'mark-v-wartime' && (
                  <Zap className="h-2.5 w-2.5 text-red-500" />
                )}
                {isTMP && (
                  <span className="text-[8px] opacity-60">★</span>
                )}
              </span>
            </Button>
          );
        })}
      </div>
      <div className="text-[10px] text-muted-foreground text-center leading-tight px-2">
        <div className="font-semibold">{currentEra?.shortName}</div>
        <div className="opacity-70">{currentEra?.shipClass}</div>
      </div>
    </div>
  );
}
