import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ModernTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
}

const ModernTextarea = forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input",
            "bg-background px-3 py-2 text-sm resize-none",
            "placeholder:text-muted-foreground",
            "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "hover:border-ring/50",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

ModernTextarea.displayName = 'ModernTextarea';

export { ModernTextarea };