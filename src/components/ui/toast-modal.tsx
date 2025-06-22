import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ToastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  autoCloseDelay?: number;
}

const ToastModal: React.FC<ToastModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'default',
  autoCloseDelay = 2000
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isOpen && autoCloseDelay > 0 && !isHovered) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose, isHovered]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-md ${
          variant === 'destructive' 
            ? 'bg-red-600 text-white border-red-600' 
            : 'bg-background text-foreground border-border'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <DialogTitle className={`text-lg font-semibold mb-2 ${
                variant === 'destructive' ? 'text-white' : 'text-foreground'
              }`}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <p className={`text-sm ${
                variant === 'destructive' ? 'text-white/90' : 'text-muted-foreground'
              }`}>
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`h-8 w-8 ml-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            } ${
              variant === 'destructive' 
                ? 'hover:bg-white/20 text-white hover:text-white' 
                : 'hover:bg-muted text-foreground hover:text-foreground'
            }`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToastModal;