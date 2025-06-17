import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CaptureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
}

const CaptureTextarea = forwardRef<HTMLTextAreaElement, CaptureTextareaProps>(
  ({ label, description, className, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-caption font-medium text-blueberry dark:text-citrus">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border-2 px-4 py-3 resize-none",
            "border-apple-core/20 dark:border-citrus/20",
            "bg-white dark:bg-surface",
            "text-blueberry dark:text-citrus text-caption",
            "placeholder:text-blueberry/50 dark:placeholder:text-apple-core/50",
            "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "hover:border-ring/50",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          placeholder={placeholder}
          {...props}
        />
        {description && (
          <p className="text-tiny text-blueberry/60 dark:text-apple-core/60">
            {description}
          </p>
        )}
      </div>
    );
  }
);

CaptureTextarea.displayName = 'CaptureTextarea';

export { CaptureTextarea };