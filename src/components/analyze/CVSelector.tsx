
import React, { useState } from 'react';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import SavedCVsDropdown from './SavedCVsDropdown';
import FileUploadArea from './upload/FileUploadArea';
import UploadedFileDisplay from './upload/UploadedFileDisplay';
import SaveCVOption from './upload/SaveCVOption';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface CVSelectorProps {
  onCVSelect: (uploadedFile: UploadedFile) => void;
  selectedCV?: UploadedFile;
  uploading: boolean;
}

const CVSelector: React.FC<CVSelectorProps> = ({ onCVSelect, selectedCV, uploading }) => {
  const { toast } = useToast();
  const [showSaveOption, setShowSaveOption] = useState(false);
  const [saveCV, setSaveCV] = useState(true);

  const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (file: File) => {
    const errors = validateFile(file, cvTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      const extractedText = await extractTextFromFile(file);
      
      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };

      onCVSelect(uploadedFile);
      setShowSaveOption(true);
      
      toast({ 
        title: 'Success', 
        description: 'CV uploaded successfully!',
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process CV file', variant: 'destructive' });
    }
  };

  const removeCV = () => {
    onCVSelect(undefined as any);
    setShowSaveOption(false);
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Upload Your CV</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Supported formats: PDF, DOCX (Max 5MB)
      </p>
      
      {!selectedCV ? (
        <>
          <FileUploadArea onFileUpload={handleFileUpload} uploading={uploading} />
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-blueberry dark:text-citrus mb-2">Saved CVs</h4>
            <SavedCVsDropdown onCVSelect={onCVSelect} selectedCV={selectedCV} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <UploadedFileDisplay uploadedFile={selectedCV} onRemove={removeCV} />

          {showSaveOption && (
            <SaveCVOption saveCV={saveCV} setSaveCV={setSaveCV} />
          )}
        </div>
      )}
    </div>
  );
};

export default CVSelector;
