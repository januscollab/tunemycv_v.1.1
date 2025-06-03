
import React, { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setIsAnimating(true);
    setTheme(newTheme);
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Sun className="h-5 w-5" />;
      case 'light':
        return <Moon className="h-5 w-5" />;
      case 'system':
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark mode';
      case 'light':
        return 'Light mode';
      case 'system':
      default:
        return 'System theme';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`
            relative text-foreground-secondary hover:text-foreground 
            hover:bg-surface-hover transition-all duration-normal
            ${isAnimating ? 'animate-theme-switch' : ''}
            focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          `}
          aria-label={getThemeLabel()}
          title={getThemeLabel()}
        >
          <div className="relative">
            {getThemeIcon()}
            <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 transition-opacity duration-fast group-hover:opacity-100" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-popover border-popover-border shadow-md animate-fade-in"
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className={`
            flex items-center gap-2 cursor-pointer transition-colors duration-fast
            ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
          `}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className={`
            flex items-center gap-2 cursor-pointer transition-colors duration-fast
            ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
          `}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className={`
            flex items-center gap-2 cursor-pointer transition-colors duration-fast
            ${theme === 'system' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
          `}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
