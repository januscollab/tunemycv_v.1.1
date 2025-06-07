import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  placeholder?: string;
  description?: string;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onDrop,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  disabled = false,
  className,
  children,
  placeholder = "Click to upload or drag and drop files here",
  description = "Supported file types"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileExtension === acceptedType.toLowerCase();
        }
        return mimeType.includes(acceptedType.replace('*', ''));
      });
      
      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }
    
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragOver(true);
    setDragError(null);
    
    // Check file types during drag
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const firstFile = files[0];
      const error = validateFile(firstFile);
      if (error) {
        setDragError(error);
      }
    }
  }, [disabled, accept, maxSize]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragError(null);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    
    if (!multiple && files.length > 1) {
      setDragError('Only one file can be uploaded at a time');
      return;
    }
    
    const validFiles: File[] = [];
    let hasError = false;
    
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setDragError(error);
        hasError = true;
        break;
      }
      validFiles.push(file);
    }
    
    if (!hasError && validFiles.length > 0) {
      onDrop(validFiles);
    }
  }, [disabled, multiple, onDrop, maxSize, accept]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onDrop(files);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 group",
        isDragOver && !dragError 
          ? "border-primary bg-primary/10 scale-[1.02] shadow-lg" 
          : "border-border hover:border-primary/50 hover:bg-accent/30",
        dragError && isDragOver
          ? "border-destructive bg-destructive/10 animate-pulse"
          : "",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:scale-[1.01]",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleFileInput}
      />
      
      {children || (
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 flex items-center justify-center">
            {dragError ? (
              <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
            ) : (
              <Upload className={cn(
                "h-8 w-8 transition-all duration-300 group-hover:scale-110",
                isDragOver ? "text-primary animate-pulse" : "text-muted-foreground"
              )} />
            )}
          </div>
          
          <div>
            <p className={cn(
              "font-medium transition-all duration-300",
              dragError ? "text-destructive animate-pulse" : 
              isDragOver ? "text-primary" : "text-foreground group-hover:text-primary"
            )}>
              {dragError || placeholder}
            </p>
            {!dragError && (
              <p className="text-sm text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-muted-foreground/80">
                {description} {accept && `(${accept})`}
                {maxSize && ` • Max ${(maxSize / 1024 / 1024).toFixed(1)}MB`}
              </p>
            )}
          </div>
        </div>
      )}
      
      {isDragOver && !dragError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg pointer-events-none animate-pulse border-2 border-primary/30" />
      )}
    </div>
  );
};