import React from 'react';
import { cn } from '@/lib/utils';

interface FormTwoColumnProps {
  children: React.ReactNode;
  className?: string;
}

const FormTwoColumn: React.FC<FormTwoColumnProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-6",
      className
    )}>
      {children}
    </div>
  );
};

interface FormSingleColumnProps {
  children: React.ReactNode;
  className?: string;
}

const FormSingleColumn: React.FC<FormSingleColumnProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "space-y-6",
      className
    )}>
      {children}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-heading font-semibold text-blueberry dark:text-citrus">
          {title}
        </h3>
        {description && (
          <p className="text-caption text-blueberry/60 dark:text-apple-core/60 mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

export { FormTwoColumn, FormSingleColumn, FormSection };