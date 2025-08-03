import { Moon, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'tactical') => {
    if (newTheme === 'tactical') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('tactical');
      localStorage.setItem('axanar-ui-theme', 'tactical');
    } else {
      document.documentElement.classList.remove('light', 'dark', 'tactical');
      document.documentElement.classList.add(newTheme);
      setTheme(newTheme);
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
          Standard LCARS
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="font-trek-content"
        >
          <Moon className="mr-2 h-4 w-4" />
          Night Mode
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('tactical')}
          className="font-trek-content"
        >
          <Zap className="mr-2 h-4 w-4" />
          Tactical Mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}