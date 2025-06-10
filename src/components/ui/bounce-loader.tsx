import React from 'react';
import { cn } from '@/lib/utils';

interface BounceLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BounceLoader: React.FC<BounceLoaderProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className={cn('flex space-x-1 justify-center items-center', className)}>
      <div className={cn(
        'rounded-full bg-current animate-bounce',
        dotSizes[size]
      )} style={{ animationDelay: '0ms' }} />
      <div className={cn(
        'rounded-full bg-current animate-bounce',
        dotSizes[size]
      )} style={{ animationDelay: '150ms' }} />
      <div className={cn(
        'rounded-full bg-current animate-bounce',
        dotSizes[size]
      )} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default BounceLoader;