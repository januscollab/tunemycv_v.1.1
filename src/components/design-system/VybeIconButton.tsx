
import React from 'react';
import { VybeButton } from './VybeButton';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VybeIconButtonProps {
  icon: LucideIcon;
  tooltip?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  ariaLabel?: string;
}

const VybeIconButton = React.forwardRef<HTMLButtonElement, VybeIconButtonProps>(
  ({ 
    icon: Icon,
    tooltip,
    onClick,
    variant = 'ghost',
    size = 'default',
    disabled,
    isLoading,
    className,
    ariaLabel,
    ...props
  }, ref) => {
    
    const sizeMap = {
      sm: { button: "h-8 w-8 p-0", icon: "h-3 w-3" },
      default: { button: "h-10 w-10 p-0", icon: "h-4 w-4" },
      lg: { button: "h-12 w-12 p-0", icon: "h-5 w-5" }
    };

    const button = (
      <VybeButton
        ref={ref}
        vybeVariant={variant}
        vybeSize="icon"
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        aria-label={ariaLabel || tooltip}
        className={cn(sizeMap[size].button, className)}
        {...props}
      >
        <Icon className={sizeMap[size].icon} />
      </VybeButton>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-caption">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);

VybeIconButton.displayName = "VybeIconButton";

export { VybeIconButton };
