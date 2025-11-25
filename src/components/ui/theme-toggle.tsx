import { Moon, Sun, Zap, Sword, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { EraSelector } from "@/components/ui/era-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'tactical' | 'klingon') => {
    setTheme(newTheme);
    
    // Switch language for Klingon theme
    if (newTheme === 'klingon') {
      i18n.changeLanguage('tlh');
    } else {
      i18n.changeLanguage('en');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="btn-lcars h-9 w-9"
          aria-label="Theme selector"
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 transition-all" />
          ) : theme === 'tactical' ? (
            <Zap className="h-4 w-4 transition-all" />
          ) : theme === 'klingon' ? (
            <Sword className="h-4 w-4 transition-all" />
          ) : (
            <Sun className="h-4 w-4 transition-all" />
          )}
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="lcars-panel">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className="font-trek-content"
        >
          <Sun className="mr-2 h-4 w-4" />
          {t('standard-lcars')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="font-trek-content"
        >
          <Moon className="mr-2 h-4 w-4" />
          {t('night-mode')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('tactical')}
          className="font-trek-content"
        >
          <Zap className="mr-2 h-4 w-4" />
          {t('tactical-mode')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('klingon')}
          className="font-trek-content"
        >
          <Sword className="mr-2 h-4 w-4" />
          {t('klingon-mode')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">LCARS Era</span>
          </div>
          <EraSelector />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}