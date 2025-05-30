
import React from 'react';
import { Upload, FileText, Briefcase, Check, X, Eye } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface FileUploadSectionProps {
  type: 'cv' | 'job_description';
  uploadedFile?: UploadedFile;
  onFileUpload: (file: File, type: 'cv' | 'job_description') => void;
  onRemoveFile: (type: 'cv' | 'job_description') => void;
  onTogglePreview: (type: 'cv' | 'job_description') => void;
  showPreview: boolean;
  uploading: boolean;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  type,
  uploadedFile,
  onFileUpload,
  onRemoveFile,
  onTogglePreview,
  showPreview,
  uploading
}) => {
  const isCV = type === 'cv';
  const title = isCV ? 'Upload Your CV' : 'Job Description';
  const subtitle = isCV 
    ? 'Supported formats: PDF, DOCX (Max 5MB)'
    : 'Upload a file (PDF, DOCX, TXT) or paste the text directly';
  const acceptTypes = isCV ? '.pdf,.docx' : '.pdf,.docx,.txt';
  const Icon = isCV ? FileText : Briefcase;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span>
            <span className="text-gray-600"> or drag and drop your {isCV ? 'CV' : 'job description file'}</span>
            <input
              type="file"
              className="hidden"
              accept={acceptTypes}
              onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], type)}
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{uploadedFile.file.name}</p>
              <p className="text-sm text-green-700">{formatFileSize(uploadedFile.file.size)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTogglePreview(type)}
              className="p-2 text-green-600 hover:bg-green-100 rounded-md"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemoveFile(type)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {showPreview && uploadedFile && (
        <div className="mt-6 bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {uploadedFile.extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
