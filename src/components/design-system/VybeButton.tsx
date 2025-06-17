import React from 'react';
import { Button, ButtonProps, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

interface VybeButtonProps extends ButtonProps {
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  vybeVariant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'ghost' | 'outline';
  vybeSize?: 'sm' | 'default' | 'lg' | 'icon';
  fullWidth?: boolean;
}

const VybeButton = React.forwardRef<HTMLButtonElement, VybeButtonProps>(
  ({ 
    className, 
    vybeVariant = 'primary', 
    vybeSize = 'default',
    isLoading, 
    icon: Icon, 
    iconPosition = 'left',
    children, 
    disabled, 
    fullWidth,
    ...props 
  }, ref) => {
    
    const getVybeStyles = () => {
      const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md";
      
      const variantStyles = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground shadow-none hover:shadow-sm",
        outline: "bg-transparent border-2 border-border text-foreground hover:bg-accent hover:border-primary/50"
      };

      const sizeStyles = {
        sm: "h-9 px-3 text-body",
        default: "h-11 px-6 text-body",
        lg: "h-12 px-8 text-subheading",
        icon: "h-11 w-11 p-0"
      };

      return `${baseStyles} ${variantStyles[vybeVariant]} ${sizeStyles[vybeSize]}`;
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {vybeSize !== 'icon' && children}
          </>
        );
      }

      if (vybeSize === 'icon') {
        return Icon ? <Icon className="h-4 w-4" /> : children;
      }

      if (iconPosition === 'right') {
        return (
          <>
            {children}
            {Icon && <Icon className="h-4 w-4" />}
          </>
        );
      }

      return (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      );
    };

    return (
      <Button
        ref={ref}
        className={cn(
          getVybeStyles(),
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {renderContent()}
      </Button>
    );
  }
);

VybeButton.displayName = "VybeButton";

export { VybeButton };