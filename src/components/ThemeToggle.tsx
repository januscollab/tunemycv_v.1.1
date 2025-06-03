
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleThemeToggle = () => {
    setIsAnimating(true);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 500);
  };

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      className={`
        relative text-foreground-secondary hover:text-foreground 
        hover:bg-surface-hover transition-all duration-normal
        ${isAnimating ? 'animate-theme-switch' : ''}
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 transition-opacity duration-fast group-hover:opacity-100" />
      </div>
    </Button>
  );
};

export default ThemeToggle;
