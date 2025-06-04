
import React, { useState } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { UploadedFile } from '@/types/fileTypes';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface JobDescriptionInputProps {
  onJobDescriptionSet: (file: UploadedFile) => void;
  uploadedFile?: UploadedFile;
  disabled?: boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobDescriptionSet,
  uploadedFile,
  disabled = false
}) => {
  const [textInput, setTextInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const { toast } = useToast();

  const jobDescTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (file: File) => {
    const errors = validateFile(file, jobDescTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const extractedText = await extractTextFromFile(file);
      
      const uploadedFileData: UploadedFile = {
        file,
        extractedText,
        type: 'job_description'
      };

      onJobDescriptionSet(uploadedFileData);
      toast({ title: 'Success', description: 'Job description uploaded successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = () => {
    const trimmedText = textInput.trim();
    if (!trimmedText) {
      toast({ title: 'Error', description: 'Please enter job description text', variant: 'destructive' });
      return;
    }

    if (trimmedText.length < 50) {
      toast({ title: 'Error', description: 'Job description must be at least 50 characters', variant: 'destructive' });
      return;
    }

    const textFile = new File([trimmedText], 'job-description.txt', { type: 'text/plain' });
    const uploadedFileData: UploadedFile = {
      file: textFile,
      extractedText: trimmedText,
      type: 'job_description'
    };

    onJobDescriptionSet(uploadedFileData);
    setTextInput('');
    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = () => {
    onJobDescriptionSet(undefined as any);
    setTextInput('');
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">{uploadedFile.file.name}</p>
            <p className="text-sm text-green-700 dark:text-green-300">Job description ready</p>
          </div>
        </div>
        <button
          onClick={removeFile}
          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Selection */}
      <div className="grid grid-cols-2 gap-2 bg-apple-core/10 dark:bg-citrus/10 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('paste')}
          className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'paste'
              ? 'bg-zapier-orange text-white'
              : 'text-blueberry/70 dark:text-apple-core/70 hover:bg-apple-core/10 dark:hover:bg-citrus/10'
          }`}
          disabled={disabled}
        >
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-zapier-orange text-white'
              : 'text-blueberry/70 dark:text-apple-core/70 hover:bg-apple-core/10 dark:hover:bg-citrus/10'
          }`}
          disabled={disabled}
        >
          Upload File
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'paste' ? (
        <div className="space-y-3">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste the job description here... (minimum 50 characters)"
            rows={8}
            maxLength={10000}
            className="w-full resize-none"
            disabled={disabled}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {textInput.length}/10000 characters {textInput.length < 50 && textInput.length > 0 && '(minimum 50 required)'}
            </span>
            <Button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || textInput.length < 50 || disabled}
              className="bg-apricot hover:bg-apricot/90"
            >
              Add Job Description
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
          <label className="cursor-pointer">
            <span className="text-apricot hover:text-apricot/80 font-medium">Upload Job Description</span>
            <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">PDF, DOCX, TXT - max 5MB</p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={uploading || disabled}
            />
          </label>
          {uploading && (
            <div className="mt-2 text-sm text-blue-600">Processing file...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDescriptionInput;
