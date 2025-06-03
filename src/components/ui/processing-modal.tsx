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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <RefreshCw className="h-12 w-12 text-zapier-orange animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default ProcessingModal;