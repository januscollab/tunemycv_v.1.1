import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface CoverLetterGenerationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

const CoverLetterGenerationModal: React.FC<CoverLetterGenerationModalProps> = ({ 
  isOpen, 
  title = "Crafting Your Cover Letter", 
  message = "Please wait while we craft your personalized cover letter..." 
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  // Humorous loading messages for cover letter generation
  const loadingMessages = [
    "Crafting your career charm offensive...",
    "Weaving words that wow recruiters...",
    "Summoning the spirit of persuasive prose...",
    "Teaching your experience to sing opera...",
    "Brewing the perfect blend of professional poetry...",
    "Orchestrating an symphony of your skills...",
    "Painting your professional portrait in words...",
    "Distilling your awesomeness into letter form...",
    "Conjuring cover letter magic...",
    "Converting your CV into compelling conversation..."
  ];

  // Rotate through humorous messages
  useEffect(() => {
    if (isOpen) {
      let messageIndex = 0;
      setCurrentMessage(loadingMessages[0]);
      
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[messageIndex]);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 text-zapier-orange animate-spin" />
            <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{currentMessage}</p>
        <div className="mt-4 text-xs text-gray-500">
          ✨ Making your experience irresistible ✨
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerationModal;