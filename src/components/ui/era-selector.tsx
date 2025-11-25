import { useTheme } from '@/contexts/ThemeContext';
import { LCARS_ERAS } from '@/lib/lcars-eras';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EraSelector() {
  const { era, setEra } = useTheme();
  
  const currentEra = LCARS_ERAS.find(e => e.id === era);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-3 gap-1">
        {LCARS_ERAS.map((eraItem) => (
          <Button
            key={eraItem.id}
            variant={era === eraItem.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setEra(eraItem.id)}
            className={cn(
              "text-xs font-mono h-8 px-2",
              era === eraItem.id && "bg-primary text-primary-foreground"
            )}
          >
            {eraItem.year}
            {eraItem.id === 'mark-v-wartime' && (
              <Zap className="h-2.5 w-2.5 ml-1 text-red-500" />
            )}
          </Button>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
        {currentEra?.shortName} • {currentEra?.shipClass}
      </div>
    </div>
  );
}
