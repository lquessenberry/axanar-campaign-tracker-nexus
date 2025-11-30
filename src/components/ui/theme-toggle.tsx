import { Moon, Sun, Zap, Sword, Rocket, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { UNIFIED_THEMES, getThemesByCategory } from "@/lib/unified-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    
    // Switch language for Klingon theme
    if (newTheme === 'klingon-d7') {
      i18n.changeLanguage('tlh');
    } else {
      i18n.changeLanguage('en');
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'sun': return <Sun className="h-8 w-8" />;
      case 'moon': return <Moon className="h-8 w-8" />;
      case 'zap': return <Zap className="h-8 w-8" />;
      case 'sword': return <Sword className="h-8 w-8" />;
      case 'rocket': return <Rocket className="h-8 w-8" />;
      case 'ship': return <Ship className="h-8 w-8" />;
      default: return <Ship className="h-8 w-8" />;
    }
  };

  const currentThemeDef = UNIFIED_THEMES.find(t => t.id === theme);
  const currentIcon = currentThemeDef ? getIcon(currentThemeDef.icon) : <Moon className="h-8 w-8" />;

  const preFederation = getThemesByCategory('pre-federation');
  const fourYearsWar = getThemesByCategory('four-years-war');
  const tos = getThemesByCategory('tos');
  const tmp = getThemesByCategory('tmp');
  const tng = getThemesByCategory('tng-era');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="btn-lcars h-[72px] w-[72px] text-foreground"
          aria-label="Theme selector"
        >
          {currentIcon}
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="lcars-panel max-h-[80vh] overflow-y-auto">
        
        {/* Pre-Federation */}
        <DropdownMenuLabel className="text-xs font-trek-heading text-muted-foreground">
          PRE-FEDERATION (2151)
        </DropdownMenuLabel>
        {preFederation.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="font-trek-content"
          >
            {getIcon(t.icon)}
            <span className="ml-2">{t.shortName}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Four Years War */}
        <DropdownMenuLabel className="text-xs font-trek-heading text-muted-foreground">
          FOUR YEARS WAR (2256)
        </DropdownMenuLabel>
        {fourYearsWar.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="font-trek-content"
          >
            {getIcon(t.icon)}
            <span className="ml-2">{t.shortName}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* TOS Era */}
        <DropdownMenuLabel className="text-xs font-trek-heading text-muted-foreground">
          TOS ERA (2265)
        </DropdownMenuLabel>
        {tos.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="font-trek-content"
          >
            {getIcon(t.icon)}
            <span className="ml-2">{t.shortName}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* TMP Era */}
        <DropdownMenuLabel className="text-xs font-trek-heading text-muted-foreground">
          TMP ERA (2273-2285)
        </DropdownMenuLabel>
        {tmp.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="font-trek-content"
          >
            {getIcon(t.icon)}
            <span className="ml-2">{t.shortName}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* TNG/DS9/VOY Era */}
        <DropdownMenuLabel className="text-xs font-trek-heading text-muted-foreground">
          TNG/DS9/VOY ERA (2350-2378)
        </DropdownMenuLabel>
        {tng.map((t) => (
          <DropdownMenuItem 
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="font-trek-content"
          >
            {getIcon(t.icon)}
            <span className="ml-2">{t.shortName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}