
import React, { forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { sanitizeText } from '@/utils/inputSanitization';
import { cn } from '@/lib/utils';

interface SecureTextareaProps extends React.ComponentProps<typeof Textarea> {
  onSecureChange?: (value: string) => void;
  maxLength?: number;
}

const SecureTextarea = forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ onSecureChange, onChange, maxLength = 10000, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        onChange(sanitizedEvent as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    return (
      <Textarea
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(className)}
        {...props}
      />
    );
  }
);

SecureTextarea.displayName = 'SecureTextarea';

export default SecureTextarea;
