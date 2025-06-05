
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeText } from '@/utils/inputSanitization';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.ComponentProps<typeof Input> {
  onSecureChange?: (value: string) => void;
  maxLength?: number;
}

const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onSecureChange, onChange, maxLength = 1000, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = sanitizeText(rawValue);
      
      // Limit length
      const limitedValue = sanitizedValue.slice(0, maxLength);
      
      if (onSecureChange) {
        onSecureChange(limitedValue);
      }
      
      if (onChange) {
        // Create a new event with sanitized value
        const sanitizedEvent = {
          ...e,
          target: {
            ...e.target,
            value: limitedValue
          }
        };
        onChange(sanitizedEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <Input
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn("border border-gray-300 dark:border-gray-600", className)}
        {...props}
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';

export default SecureInput;
