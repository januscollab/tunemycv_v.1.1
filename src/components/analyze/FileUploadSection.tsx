
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
    <div className="bg-card rounded-lg shadow-sm p-6 border border-card-border transition-all duration-normal hover:shadow-md">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-accent/20 transition-all duration-normal group">
          <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-primary group-hover:scale-110 transition-all duration-normal" />
          <label className="cursor-pointer">
            <span className="text-primary hover:text-primary/80 font-medium transition-colors duration-normal">Click to upload</span>
            <span className="text-muted-foreground"> or drag and drop your {isCV ? 'CV' : 'job description file'}</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg transition-all duration-normal hover:bg-success/15">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-success animate-scale-in" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-success-foreground truncate">{uploadedFile.file.name}</p>
              <p className="text-sm text-success/80">{formatFileSize(uploadedFile.file.size)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => onTogglePreview(type)}
              className="p-2 text-success hover:bg-success/20 rounded-md transition-all duration-normal hover:scale-110 active:scale-95"
              title="Preview content"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemoveFile(type)}
              className="p-2 text-destructive hover:bg-destructive/20 rounded-md transition-all duration-normal hover:scale-110 active:scale-95"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {showPreview && uploadedFile && (
        <div className="mt-6 bg-muted rounded-md p-4 max-h-64 overflow-y-auto border border-border animate-fade-in">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {uploadedFile.extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
