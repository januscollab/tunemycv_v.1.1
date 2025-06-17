import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LucideIcon } from 'lucide-react';

interface VybeSelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

interface VybeSelectProps {
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: VybeSelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'default' | 'lg';
}

const VybeSelect = forwardRef<HTMLButtonElement, VybeSelectProps>(
  ({ 
    label, 
    description, 
    placeholder, 
    value, 
    onValueChange, 
    options, 
    disabled, 
    required, 
    className,
    icon: TriggerIcon,
    size = 'default'
  }, ref) => {
    
    const sizeStyles = {
      sm: "h-9 px-3 text-body",
      default: "h-11 px-4 text-body",
      lg: "h-12 px-6 text-subheading"
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-body font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              "bg-background border-input-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-normal shadow-sm hover:shadow-md",
              sizeStyles[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <div className="flex items-center gap-3 w-full">
              {TriggerIcon && <TriggerIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
              <SelectValue placeholder={placeholder} className="text-foreground" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[200] bg-popover border-popover-border shadow-lg">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="flex items-center gap-3 py-3 px-4 hover:bg-accent/50 focus:bg-accent cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  {option.icon && (
                    <option.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-foreground">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-caption text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && (
          <p className="text-caption text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

VybeSelect.displayName = 'VybeSelect';

export { VybeSelect, type VybeSelectOption };