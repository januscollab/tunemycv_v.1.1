import React, { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CaptureTextareaWithPasteProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  onImagePaste?: (files: File[]) => void;
}

const CaptureTextareaWithPaste = forwardRef<HTMLTextAreaElement, CaptureTextareaWithPasteProps>(
  ({ label, description, className, placeholder, onImagePaste, ...props }, ref) => {
    
    const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onImagePaste) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        onImagePaste(imageFiles);
        toast.success(`Pasted ${imageFiles.length} image(s)`);
      }
    }, [onImagePaste]);

    return (
      <div className="space-y-2">
        <label className="block text-caption font-medium text-blueberry dark:text-citrus">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border px-4 py-3 resize-none",
            "border-apple-core/20 dark:border-citrus/20",
            "bg-white dark:bg-surface",
            "text-blueberry dark:text-citrus text-caption",
            "placeholder:text-blueberry/50 dark:placeholder:text-apple-core/50",
            "focus:border-ring focus:outline-none",
            "hover:border-ring/50",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          placeholder={placeholder}
          onPaste={handlePaste}
          {...props}
        />
        {description && (
          <p className="text-tiny text-blueberry/60 dark:text-apple-core/60">
            {description}
          </p>
        )}
        {onImagePaste && (
          <p className="text-tiny text-blueberry/40 dark:text-apple-core/40">
            💡 Tip: You can paste images directly here
          </p>
        )}
      </div>
    );
  }
);

CaptureTextareaWithPaste.displayName = 'CaptureTextareaWithPaste';

export { CaptureTextareaWithPaste };