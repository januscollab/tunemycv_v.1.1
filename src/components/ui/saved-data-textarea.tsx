import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SavedDataTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
}

const SavedDataTextarea = forwardRef<HTMLTextAreaElement, SavedDataTextareaProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-caption font-medium text-blueberry dark:text-citrus">
          {label}
          {props.required && <span className="text-zapier-orange ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border-2 px-4 py-3 resize-none",
            "border-apple-core/20 dark:border-citrus/20",
            "bg-white dark:bg-surface",
            "text-blueberry dark:text-citrus text-caption",
            "focus:border-zapier-orange focus:ring-0 focus:outline-none",
            "hover:border-zapier-orange/50",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
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

SavedDataTextarea.displayName = 'SavedDataTextarea';

export { SavedDataTextarea };