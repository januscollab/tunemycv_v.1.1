
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Clock } from 'lucide-react';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
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

  const handleSecureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeText(rawValue);
    const limitedValue = sanitizedValue.slice(0, 10000);
    
    setText(limitedValue);
    setLastSaved(null); // Clear saved status when text changes
  };

  const getStatusMessage = () => {
    if (isAutoSaving) {
      return (
        <div className="flex items-center text-caption text-info">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Auto-saving...
        </div>
      );
    }
    
    if (lastSaved && text.length >= 50) {
      return (
        <div className="flex items-center text-caption text-success">
          <Check className="h-3 w-3 mr-1" />
          Saved at {lastSaved}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div>
      <FloatingLabelTextarea
        label="Job Description"
        value={text}
        onChange={handleSecureChange}
        placeholder="Paste the job description here... (auto-saves after 2 seconds, minimum 50 characters)"
        rows={8}
        maxLength={10000}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-col space-y-1">
          <span className="text-caption text-muted-foreground">
            {text.length}/10000 characters {text.length < 50 && text.length > 0 && '(minimum 50 required)'}
          </span>
          {getStatusMessage()}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionTextInput;
