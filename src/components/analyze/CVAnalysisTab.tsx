
import React from 'react';
import CVSelector from './CVSelector';
import JobDescriptionInput from './JobDescriptionInput';
import AnalyzeButton from './AnalyzeButton';
import { UploadedFile } from '@/types/fileTypes';

interface CVAnalysisTabProps {
  uploadedFiles: {
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  };
  jobTitle: string;
  setJobTitle: (title: string) => void;
  onCVSelect: (uploadedFile: UploadedFile) => void;
  onJobDescriptionSet: (uploadedFile: UploadedFile) => void;
  onAnalysis: () => void;
  canAnalyze: boolean;
  analyzing: boolean;
  hasCreditsForAI: boolean;
  uploading: boolean;
}

const CVAnalysisTab: React.FC<CVAnalysisTabProps> = ({
  uploadedFiles,
  jobTitle,
  setJobTitle,
  onCVSelect,
  onJobDescriptionSet,
  onAnalysis,
  canAnalyze,
  analyzing,
  hasCreditsForAI,
  uploading
}) => {
  return (
    <div className="space-y-6">
      {/* Job Title */}
      <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Job Title</h3>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
          className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
          disabled={analyzing}
        />
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-2">
          Job title will be automatically extracted from the job description if not provided.
        </p>
      </div>

      {/* Job Description Input - Required */}
      <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">
          Job Description <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
          Upload a file (PDF, DOCX, TXT) or paste the text directly
        </p>
        
        <JobDescriptionInput
          onJobDescriptionSet={onJobDescriptionSet}
          uploadedFile={uploadedFiles.jobDescription}
          disabled={uploading || analyzing}
        />
      </div>

      {/* CV Selection - Optional */}
      <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">
          Your CV <span className="text-sm font-normal text-blueberry/70 dark:text-apple-core/80">(Optional)</span>
        </h3>
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
          Upload your CV for comprehensive analysis. Without a CV, we'll provide general insights about the job requirements.
        </p>
        
        <CVSelector
          onCVSelect={onCVSelect}
          selectedCV={uploadedFiles.cv}
          uploading={uploading || analyzing}
        />
      </div>

      {/* Analyze Button */}
      <AnalyzeButton
        onAnalyze={onAnalysis}
        canAnalyze={!!canAnalyze}
        analyzing={analyzing}
        hasCreditsForAI={hasCreditsForAI}
      />
    </div>
  );
};

export default CVAnalysisTab;
