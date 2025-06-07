import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Progress } from './progress';
import { Button } from './button';

interface ProcessingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onCancel?: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  isOpen, 
  title = "Processing Document", 
  message = "Extracting text from your document...",
  onCancel
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTimeElapsed(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (timeElapsed <= 15) {
      setProgress((timeElapsed / 15) * 30);
    } else if (timeElapsed <= 30) {
      setProgress(30 + ((timeElapsed - 15) / 15) * 40);
    } else {
      setProgress(70 + ((timeElapsed - 30) / 30) * 25);
    }
  }, [timeElapsed]);

  if (!isOpen) return null;

  const getTimeBasedMessage = () => {
    if (timeElapsed > 30) {
      return "We apologize for the delay. This document is taking longer than expected to process. You can continue waiting or try again later.";
    } else if (timeElapsed > 15) {
      return "Taking longer than expected... Please bear with us while we process your document.";
    }
    return message;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background dark:bg-card rounded-lg p-8 text-center max-w-md shadow-lg border">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold text-foreground flex-1">{title}</h3>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-6 w-6 -mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <Progress value={Math.min(progress, 95)} className="w-full mb-2" />
          <div className="text-sm text-muted-foreground">
            {Math.round(Math.min(progress, 95))}% • {formatTime(timeElapsed)}
          </div>
        </div>
        
        <p className="text-muted-foreground min-h-[3rem] transition-opacity duration-500 mb-4">
          {getTimeBasedMessage()}
        </p>

        {timeElapsed > 30 && onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel Upload
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProcessingModal;