
import React, { useState } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import SavedCVsDropdown from './SavedCVsDropdown';

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
      
      // Show success with green background
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
          <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center mb-4">
            <FileText className="mx-auto h-12 w-12 text-blueberry/40 dark:text-apple-core/40 mb-4" />
            <label className="cursor-pointer">
              <span className="text-apricot hover:text-apricot/80 font-medium">Click to upload</span>
              <span className="text-blueberry/70 dark:text-apple-core/70"> or drag and drop your CV</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={uploading}
              />
            </label>
          </div>
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-blueberry dark:text-citrus mb-2">Saved CVs</h4>
            <SavedCVsDropdown onCVSelect={onCVSelect} selectedCV={selectedCV} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{selectedCV.file.name}</p>
                <p className="text-sm text-green-700">{formatFileSize(selectedCV.file.size)}</p>
              </div>
            </div>
            <button
              onClick={removeCV}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {showSaveOption && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default CVSelector;
