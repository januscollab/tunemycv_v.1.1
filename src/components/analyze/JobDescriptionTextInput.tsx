
import React, { useState } from 'react';

interface JobDescriptionTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

const JobDescriptionTextInput: React.FC<JobDescriptionTextInputProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
    setText('');
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the job description here..."
        rows={8}
        className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="mt-2 px-4 py-2 bg-apricot text-white rounded-md hover:bg-apricot/90 transition-colors disabled:opacity-50"
      >
        Add Job Description
      </button>
    </div>
  );
};

export default JobDescriptionTextInput;
