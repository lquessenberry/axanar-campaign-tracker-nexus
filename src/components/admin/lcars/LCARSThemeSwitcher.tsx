import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check, Rocket, Swords, Zap, Ship, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeOption {
  id: string;
  label: string;
  era: string;
  icon: React.ReactNode;
  className: string;
}

const THEMES: ThemeOption[] = [
  // Pre-Federation
  { id: 'theme-nx-2151', label: 'NX-01', era: '2151', icon: <Rocket className="h-4 w-4" />, className: 'text-blue-400' },
  
  // Four Years War
  { id: 'theme-ares-mk4-light', label: 'Ares MkIV', era: '2245', icon: <Ship className="h-4 w-4" />, className: 'text-amber-400' },
  { id: 'theme-hercules-mk4-dark', label: 'Hercules MkIV', era: '2245', icon: <Ship className="h-4 w-4" />, className: 'text-orange-400' },
  { id: 'theme-mark-v-wartime', label: 'Mark V Wartime', era: '2245', icon: <Swords className="h-4 w-4" />, className: 'text-red-400' },
  { id: 'theme-klingon-d7', label: 'Klingon D7', era: '2245', icon: <Zap className="h-4 w-4" />, className: 'text-green-400' },
  
  // TOS Era
  { id: 'theme-constitution-2265', label: 'Constitution', era: '2265', icon: <Sparkles className="h-4 w-4" />, className: 'text-yellow-400' },
  
  // TMP Era
  { id: 'theme-tmp-refit-2273', label: 'TMP Refit', era: '2273', icon: <Ship className="h-4 w-4" />, className: 'text-orange-300' },
  { id: 'theme-excelsior-2285', label: 'Excelsior', era: '2285', icon: <Ship className="h-4 w-4" />, className: 'text-amber-300' },
  
  // TNG Era
  { id: 'theme-ambassador-2350', label: 'Ambassador', era: '2350', icon: <Ship className="h-4 w-4" />, className: 'text-purple-400' },
  { id: 'theme-galaxy-2363', label: 'Galaxy', era: '2363', icon: <Ship className="h-4 w-4" />, className: 'text-purple-300' },
  { id: 'theme-defiant-2371', label: 'Defiant', era: '2371', icon: <Swords className="h-4 w-4" />, className: 'text-cyan-400' },
  { id: 'theme-sovereign-2378', label: 'Sovereign', era: '2378', icon: <Ship className="h-4 w-4" />, className: 'text-blue-300' },
];

const LCARSThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Read initial theme from document or localStorage
    const saved = localStorage.getItem('lcars-theme');
    if (saved && THEMES.some(t => t.id === saved)) return saved;
    
    // Check current class on document
    const current = THEMES.find(t => document.documentElement.classList.contains(t.id));
    return current?.id || 'theme-hercules-mk4-dark';
  });

  const handleThemeChange = (themeId: string) => {
    // Remove all theme classes
    THEMES.forEach(t => document.documentElement.classList.remove(t.id));
    
    // Add new theme class
    document.documentElement.classList.add(themeId);
    
    // Save to localStorage
    localStorage.setItem('lcars-theme', themeId);
    setCurrentTheme(themeId);
  };

  const current = THEMES.find(t => t.id === currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          title="Switch Theme"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden md:inline text-xs">{current?.label || 'Theme'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          LCARS Era Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Group by era */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Pre-Federation</DropdownMenuLabel>
        {THEMES.filter(t => t.era === '2151').map(theme => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Four Years War (2245)</DropdownMenuLabel>
        {THEMES.filter(t => t.era === '2245').map(theme => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">TOS Era</DropdownMenuLabel>
        {THEMES.filter(t => t.era === '2265').map(theme => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">TMP Era</DropdownMenuLabel>
        {THEMES.filter(t => ['2273', '2285'].includes(t.era)).map(theme => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">TNG/DS9/VOY Era</DropdownMenuLabel>
        {THEMES.filter(t => ['2350', '2363', '2371', '2378'].includes(t.era)).map(theme => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ThemeMenuItem = ({ 
  theme, 
  isActive, 
  onSelect 
}: { 
  theme: ThemeOption; 
  isActive: boolean; 
  onSelect: () => void;
}) => (
  <DropdownMenuItem
    onClick={onSelect}
    className={cn(
      'flex items-center gap-2 cursor-pointer',
      isActive && 'bg-primary/10'
    )}
  >
    <span className={theme.className}>{theme.icon}</span>
    <span className="flex-1">{theme.label}</span>
    <span className="text-xs text-muted-foreground">{theme.era}</span>
    {isActive && <Check className="h-4 w-4 text-primary" />}
  </DropdownMenuItem>
);

export default LCARSThemeSwitcher;
