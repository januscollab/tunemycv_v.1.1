import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  isOpen, 
  title = "Processing Document", 
  message = "Extracting text from your document..." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background dark:bg-card rounded-lg p-8 text-center max-w-md shadow-lg border">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary/20 border-t-primary mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground min-h-[1.5rem] transition-opacity duration-500">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ProcessingModal;