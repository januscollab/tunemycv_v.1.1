import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

interface VybeButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  vybeVariant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'ghost' | 'outline' | 'white' | 'dark';
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
      const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border";
      
      const variantStyles = {
        primary: "bg-[#FF6B35] text-white border-[#FF6B35] hover:bg-[#E55A2B] hover:shadow-lg focus-visible:ring-[#FF6B35]/50",
        secondary: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:shadow-md focus-visible:ring-gray-500/50",
        destructive: "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:shadow-lg focus-visible:ring-red-500/50",
        success: "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:shadow-lg focus-visible:ring-green-500/50",
        ghost: "bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900 shadow-none hover:shadow-sm",
        outline: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus-visible:ring-gray-500/50",
        white: "bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:shadow-lg focus-visible:ring-gray-500/50",
        dark: "bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:shadow-lg focus-visible:ring-gray-900/50"
      };

      const sizeStyles = {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
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