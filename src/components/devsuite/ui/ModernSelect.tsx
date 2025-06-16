import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModernSelectProps {
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const ModernSelect = forwardRef<HTMLButtonElement, ModernSelectProps>(
  ({ label, description, placeholder, value, onValueChange, options, disabled, required, className }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              "transition-all duration-200",
              "hover:border-ring/50",
              "focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

ModernSelect.displayName = 'ModernSelect';

export { ModernSelect };