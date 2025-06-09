import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  size = 'md',
  variant = 'default',
  showPercentage = true,
  label,
  className
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: '',
    success: '[&>div]:bg-green-500',
    warning: '[&>div]:bg-yellow-500',
    destructive: '[&>div]:bg-red-500'
  };

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <Progress
        value={value}
        className={cn(
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

interface BounceLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BounceLoader: React.FC<BounceLoaderProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-bounce",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WaveLoader: React.FC<WaveLoaderProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-3',
    md: 'w-1 h-4',
    lg: 'w-1.5 h-6'
  };

  return (
    <div className={cn("flex items-end space-x-1", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

interface PulseRingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseRing: React.FC<PulseRingProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-75" />
      <div className="absolute inset-2 border-2 border-primary rounded-full animate-ping opacity-50" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-4 bg-primary rounded-full" />
    </div>
  );
};

interface MorphingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MorphingDots: React.FC<MorphingDotsProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary animate-pulse transform-gpu transition-all duration-300",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            borderRadius: i === 1 ? '0%' : '50%'
          }}
        />
      ))}
    </div>
  );
};