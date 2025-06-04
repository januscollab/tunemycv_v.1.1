import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  isOpen, 
  title = "Processing", 
  message = "Please wait while we process your request..." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 text-center max-w-md">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apricot mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">{title}</h3>
        <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[1.5rem] transition-opacity duration-500 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ProcessingModal;