
import React, { useState } from 'react';
import { FileText, Upload, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import CVSelectorDropdown from './CVSelectorDropdown';
import FileUploadArea from './upload/FileUploadArea';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFileUpload, setShowFileUpload] = useState(false);

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
      setShowFileUpload(false);
      toast({ title: 'Success', description: 'CV uploaded successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process CV file', variant: 'destructive' });
    }
  };

  const handleSavedCVSelect = (savedCV: any) => {
    // Create a File object from saved CV data (don't save as new copy)
    const textFile = new File([savedCV.extracted_text], savedCV.file_name, { 
      type: savedCV.file_type || 'application/pdf' 
    });
    
    const uploadedFile: UploadedFile = {
      file: textFile,
      extractedText: savedCV.extracted_text,
      type: 'cv'
    };

    onCVSelect(uploadedFile);
    toast({ 
      title: 'Success', 
      description: `Using saved CV: ${savedCV.file_name}` 
    });
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Select Your CV</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Choose from your saved CVs or upload a new one
      </p>

      {!selectedCV ? (
        <div className="space-y-4">
          {/* Saved CVs Dropdown */}
          {user && (
            <CVSelectorDropdown onCVSelect={handleSavedCVSelect} disabled={uploading} />
          )}

          {/* Upload New CV Option */}
          <div className="text-center">
            <div className="text-blueberry/60 dark:text-apple-core/60 mb-2">or</div>
            {!showFileUpload ? (
              <button
                onClick={() => setShowFileUpload(true)}
                disabled={uploading}
                className="w-full bg-apricot text-white py-3 px-4 rounded-lg hover:bg-apricot/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload New CV
              </button>
            ) : (
              <FileUploadArea
                onFileSelect={handleFileUpload}
                acceptedTypes={cvTypes}
                maxSize={maxSize}
                label="Upload CV (PDF, DOCX)"
                disabled={uploading}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{selectedCV.file.name}</p>
              <p className="text-sm text-green-700">CV ready for analysis</p>
            </div>
          </div>
          <button
            onClick={() => {
              onCVSelect(undefined as any);
              setShowFileUpload(false);
            }}
            className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            disabled={uploading}
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CVSelector;
