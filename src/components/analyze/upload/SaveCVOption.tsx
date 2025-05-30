
import React from 'react';

interface SaveCVOptionProps {
  saveCV: boolean;
  setSaveCV: (save: boolean) => void;
}

const SaveCVOption: React.FC<SaveCVOptionProps> = ({ saveCV, setSaveCV }) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={saveCV}
          onChange={(e) => setSaveCV(e.target.checked)}
          className="text-blue-600"
        />
        <span className="text-sm text-blue-900">
          Save this CV to my profile for future use
        </span>
      </label>
    </div>
  );
};

export default SaveCVOption;
