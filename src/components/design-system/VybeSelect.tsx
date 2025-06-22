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
      sm: "h-9 px-3 text-sm",
      default: "h-11 px-4 text-sm",
      lg: "h-12 px-6 text-base"
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              "bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg",
              sizeStyles[size],
              disabled && "opacity-50 cursor-not-allowed bg-gray-50",
              className
            )}
          >
            <div className="flex items-center gap-3 w-full">
              {TriggerIcon && <TriggerIcon className="h-4 w-4 text-gray-500 shrink-0" />}
              <SelectValue placeholder={placeholder} className="text-gray-900" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="flex items-center gap-3 py-3 px-4 hover:bg-orange-50 focus:bg-orange-100 cursor-pointer transition-colors border-l-4 border-transparent hover:border-l-orange-400 focus:border-l-orange-500"
              >
                <div className="flex items-center gap-3 w-full">
                  {option.icon && (
                    <option.icon className="h-4 w-4 text-gray-600 shrink-0" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-gray-500">
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
          <p className="text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
    );
  }
);

VybeSelect.displayName = 'VybeSelect';

export { VybeSelect, type VybeSelectOption };