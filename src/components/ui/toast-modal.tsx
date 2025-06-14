import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ToastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const ToastModal: React.FC<ToastModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'default'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <DialogTitle className={`text-lg font-semibold mb-2 ${
                variant === 'destructive' ? 'text-destructive' : 'text-foreground'
              }`}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <p className={`text-sm ${
                variant === 'destructive' ? 'text-destructive/80' : 'text-muted-foreground'
              }`}>
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToastModal;