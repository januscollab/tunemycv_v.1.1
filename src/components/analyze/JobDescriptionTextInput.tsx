
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Clock } from 'lucide-react';
import { UnifiedTextarea } from '@/components/ui/unified-input';
import { sanitizeText } from '@/utils/inputSanitization';

interface JobDescriptionTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

const JobDescriptionTextInput: React.FC<JobDescriptionTextInputProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const autoSave = useCallback(async (content: string) => {
    const sanitizedText = sanitizeText(content.trim());
    if (sanitizedText.length < 50) {
      return;
    }

    setIsAutoSaving(true);
    
    // Simulate a brief delay for visual feedback
    setTimeout(() => {
      onSubmit(sanitizedText);
      setLastSaved(new Date().toLocaleTimeString());
      setIsAutoSaving(false);
    }, 300);
  }, [onSubmit]);

  // Debounced autosave effect
  useEffect(() => {
    if (text.length < 50 || disabled) return;

    const timeoutId = setTimeout(() => {
      autoSave(text);
    }, 2000); // 2 second delay

    return () => clearTimeout(timeoutId);
  }, [text, autoSave, disabled]);

  const handleSecureChange = (value: string) => {
    setText(value);
    setLastSaved(null); // Clear saved status when text changes
  };

  const getStatusMessage = () => {
    if (isAutoSaving) {
      return (
        <div className="flex items-center text-caption text-blue-600 dark:text-blue-400">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Auto-saving...
        </div>
      );
    }
    
    if (lastSaved && text.length >= 50) {
      return (
        <div className="flex items-center text-caption text-green-600 dark:text-green-400">
          <Check className="h-3 w-3 mr-1" />
          Saved at {lastSaved}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div>
      <UnifiedTextarea
        variant="floating"
        label="Job Description"
        value={text}
        onSecureChange={handleSecureChange}
        placeholder="Paste the job description here... (auto-saves after 2 seconds, minimum 50 characters)"
        rows={8}
        maxLength={10000}
        disabled={disabled}
        secure
        className="w-full"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-col space-y-1">
          <span className="text-caption text-gray-500">
            {text.length}/10000 characters {text.length < 50 && text.length > 0 && '(minimum 50 required)'}
          </span>
          {getStatusMessage()}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionTextInput;
