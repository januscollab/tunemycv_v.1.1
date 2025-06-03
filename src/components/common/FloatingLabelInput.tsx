import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFloating = isFocused || (value && String(value).length > 0);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleLabelClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "peer w-full h-12 px-4 pt-6 pb-2 bg-white dark:bg-surface border-2 rounded-lg",
          "border-apple-core/20 dark:border-citrus/20",
          "focus:border-zapier-orange focus:ring-0 focus:outline-none",
          "text-blueberry dark:text-citrus text-sm",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      <label
        onClick={handleLabelClick}
        className={cn(
          "absolute left-4 cursor-text transition-all duration-200 pointer-events-none",
          "text-blueberry/60 dark:text-apple-core/60",
          isFloating
            ? "top-1.5 text-xs font-medium text-zapier-orange"
            : "top-1/2 -translate-y-1/2 text-sm"
        )}
      >
        {label}
        {props.required && <span className="text-zapier-orange ml-1">*</span>}
      </label>
    </div>
  );
};