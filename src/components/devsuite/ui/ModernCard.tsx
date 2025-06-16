import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card shadow-sm transition-all duration-200",
        "hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

const ModernCardHeader = React.forwardRef<HTMLDivElement, ModernCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModernCardTitle = React.forwardRef<HTMLParagraphElement, ModernCardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
);

const ModernCardContent = React.forwardRef<HTMLDivElement, ModernCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModernCard.displayName = 'ModernCard';
ModernCardHeader.displayName = 'ModernCardHeader';
ModernCardTitle.displayName = 'ModernCardTitle';
ModernCardContent.displayName = 'ModernCardContent';

export { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent };