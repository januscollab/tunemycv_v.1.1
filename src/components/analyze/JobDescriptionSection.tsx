
import React from 'react';
import JobDescriptionTextInput from './JobDescriptionTextInput';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface JobDescriptionSectionProps {
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile };
  uploading: boolean;
  handleFileUpload: (file: File, type: 'job_description') => void;
  handleJobDescriptionText: (text: string) => void;
  removeFile: (type: 'jobDescription') => void;
}

const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({
  uploadedFiles,
  uploading,
  handleFileUpload,
  handleJobDescriptionText,
  removeFile
}) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Job Description</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">Upload a file (PDF, DOCX, TXT) or paste the text directly</p>
      
      <div className="space-y-4">
        {!uploadedFiles.jobDescription ? (
          <>
            <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
              <label className="cursor-pointer">
                <span className="text-apricot hover:text-apricot/80 font-medium">Click to upload</span>
                <span className="text-blueberry/70 dark:text-apple-core/70"> or drag and drop your job description file</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'job_description')}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
            
            <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading} />
          </>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">{uploadedFiles.jobDescription.file.name}</p>
                <p className="text-sm text-green-700">Job description ready</p>
              </div>
            </div>
            <button
              onClick={() => removeFile('jobDescription')}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionSection;
