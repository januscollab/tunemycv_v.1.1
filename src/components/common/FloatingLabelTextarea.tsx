import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const FloatingLabelTextarea: React.FC<FloatingLabelTextareaProps> = ({
  label,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isFloating = isFocused || (value && String(value).length > 0);

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleLabelClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "peer w-full min-h-[100px] px-4 pt-8 pb-2 bg-white dark:bg-surface border-2 rounded-lg resize-none",
          "border-apple-core/20 dark:border-citrus/20",
          "focus:border-zapier-orange focus:ring-0 focus:outline-none",
           "text-blueberry dark:text-citrus text-caption",
           "placeholder:text-blueberry/50 dark:placeholder:text-apple-core/50",
           "transition-all duration-200",
           "disabled:opacity-50 disabled:cursor-not-allowed",
           className
         )}
         placeholder={!isFloating ? "" : "Mention specific achievements, metrics, or experiences you want emphasized in your cover letter..."}
         {...props}
       />
        <label
          onClick={handleLabelClick}
          className={cn(
            "absolute left-4 cursor-text transition-all duration-200 pointer-events-none",
            "text-blueberry/60 dark:text-apple-core/60",
             isFloating
               ? "top-1.5 text-tiny font-medium text-zapier-orange"
               : "top-6 text-caption"
        )}
      >
        {label}
        {props.required && <span className="text-zapier-orange ml-1">*</span>}
      </label>
    </div>
  );
};