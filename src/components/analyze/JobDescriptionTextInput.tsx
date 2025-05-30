
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Add Job Description
      </button>
    </div>
  );
};

export default JobDescriptionTextInput;
