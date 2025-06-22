import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

interface ModernButtonProps extends ButtonProps {
  isLoading?: boolean;
  icon?: LucideIcon;
  modernVariant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'ghost' | 'outline';
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, modernVariant = 'primary', isLoading, icon: Icon, children, disabled, ...props }, ref) => {
    const getModernStyles = () => {
      const baseStyles = "rounded-lg font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]";
      
      switch (modernVariant) {
        case 'primary':
          return `${baseStyles} bg-slate-700 text-white hover:bg-slate-600 hover:shadow-md focus:ring-slate-500`;
        case 'secondary':
          return `${baseStyles} bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 hover:border-slate-400 focus:ring-slate-500`;
        case 'destructive':
          return `${baseStyles} bg-red-500 text-white hover:bg-red-600 hover:shadow-md focus:ring-red-500`;
        case 'success':
          return `${baseStyles} bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md focus:ring-emerald-500`;
        case 'ghost':
          return `${baseStyles} text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-500 shadow-none hover:shadow-sm`;
        case 'outline':
          return `${baseStyles} bg-transparent border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500`;
        default:
          return baseStyles;
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(getModernStyles(), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
      </Button>
    );
  }
);

ModernButton.displayName = "ModernButton";

export { ModernButton };