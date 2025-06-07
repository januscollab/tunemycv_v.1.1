import * as React from "react";
import { cn } from "@/lib/utils";
import { sanitizeText } from "@/utils/inputSanitization";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-md border-2 bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary hover:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        standard: "h-10 px-3 py-2 border-input",
        floating: "h-12 px-4 pt-6 pb-2",
        secure: "h-10 px-3 py-2 border-input",
        minimal: "h-10 px-3 py-2 border-transparent border-b-2 border-b-input rounded-none focus:border-b-primary",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "standard",
      size: "default",
    },
  }
);

const textareaVariants = cva(
  "flex w-full rounded-md border-2 bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary hover:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        standard: "min-h-[80px] px-3 py-2 border-input",
        floating: "min-h-[100px] px-4 pt-6 pb-2",
        secure: "min-h-[80px] px-3 py-2 border-input",
        minimal: "min-h-[80px] px-3 py-2 border-transparent border-b-2 border-b-input rounded-none focus:border-b-primary",
      },
      size: {
        sm: "min-h-[60px] px-2 text-xs",
        default: "",
        lg: "min-h-[120px] px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "standard",
      size: "default",
    },
  }
);

export interface UnifiedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  onSecureChange?: (value: string) => void;
  maxLength?: number;
  secure?: boolean;
}

export interface UnifiedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  onSecureChange?: (value: string) => void;
  maxLength?: number;
  secure?: boolean;
}

const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    label, 
    onSecureChange, 
    onChange, 
    maxLength = 1000, 
    secure = false,
    value,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    
    const isFloating = variant === "floating";
    const shouldFloat = isFocused || (internalValue && String(internalValue).length > 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      let processedValue = rawValue;
      
      if (secure) {
        processedValue = sanitizeText(rawValue);
        processedValue = processedValue.slice(0, maxLength);
      }
      
      setInternalValue(processedValue);
      
      if (onSecureChange) {
        onSecureChange(processedValue);
      }
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: processedValue
          }
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    if (isFloating && label) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(inputVariants({ variant, size, className }))}
            ref={ref}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={secure ? maxLength : undefined}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 cursor-text transition-all duration-200 pointer-events-none",
              "text-blueberry/60 dark:text-apple-core/60",
              shouldFloat
                ? "top-1.5 text-micro font-medium text-zapier-orange"
                : "top-1/2 -translate-y-1/2 text-caption"
            )}
          >
            {label}
            {props.required && <span className="text-zapier-orange ml-1">*</span>}
          </label>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={secure ? maxLength : undefined}
        {...props}
      />
    );
  }
);

const UnifiedTextarea = React.forwardRef<HTMLTextAreaElement, UnifiedTextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    onSecureChange, 
    onChange, 
    maxLength = 10000, 
    secure = false,
    value,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    const isFloating = variant === "floating";
    const shouldFloat = isFocused || (internalValue && String(internalValue).length > 0);

    // Auto-resize functionality for floating variant
    React.useEffect(() => {
      if (isFloating && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
      }
    }, [internalValue, isFloating]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const rawValue = e.target.value;
      let processedValue = rawValue;
      
      if (secure) {
        processedValue = sanitizeText(rawValue);
        processedValue = processedValue.slice(0, maxLength);
      }
      
      setInternalValue(processedValue);
      
      if (onSecureChange) {
        onSecureChange(processedValue);
      }
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: processedValue
          }
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    if (isFloating && label) {
      return (
        <div className="relative">
          <textarea
            className={cn(textareaVariants({ variant, size, className }))}
            ref={(element) => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(element);
                } else {
                  ref.current = element;
                }
              }
              textareaRef.current = element;
            }}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={secure ? maxLength : undefined}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 cursor-text transition-all duration-200 pointer-events-none",
              "text-blueberry/60 dark:text-apple-core/60",
              shouldFloat
                ? "top-1.5 text-micro font-medium text-zapier-orange"
                : "top-6 text-caption"
            )}
          >
            {label}
            {props.required && <span className="text-zapier-orange ml-1">*</span>}
          </label>
        </div>
      );
    }

    return (
      <textarea
        className={cn(textareaVariants({ variant, size, className }))}
        ref={(element) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(element);
            } else {
              ref.current = element;
            }
          }
          textareaRef.current = element;
        }}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={secure ? maxLength : undefined}
        {...props}
      />
    );
  }
);

UnifiedInput.displayName = "UnifiedInput";
UnifiedTextarea.displayName = "UnifiedTextarea";

export { UnifiedInput, UnifiedTextarea, inputVariants, textareaVariants };