
import React, { useState } from 'react';
import SecureTextarea from '@/components/security/SecureTextarea';
import { sanitizeText } from '@/utils/inputSanitization';

interface JobDescriptionTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

const JobDescriptionTextInput: React.FC<JobDescriptionTextInputProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const sanitizedText = sanitizeText(text.trim());
    if (sanitizedText.length < 50) {
      return; // Minimum job description length
    }
    onSubmit(sanitizedText);
    setText('');
  };

  const handleSecureChange = (value: string) => {
    setText(value);
  };

  return (
    <div>
      <SecureTextarea
        value={text}
        onSecureChange={handleSecureChange}
        placeholder="Paste the job description here... (minimum 50 characters)"
        rows={8}
        maxLength={10000}
        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">
          {text.length}/10000 characters {text.length < 50 && text.length > 0 && '(minimum 50 required)'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || text.length < 50 || disabled}
          className="px-4 py-2 bg-apricot text-white rounded-md hover:bg-apricot/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Job Description
        </button>
      </div>
    </div>
  );
};

export default JobDescriptionTextInput;
