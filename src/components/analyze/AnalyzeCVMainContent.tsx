
import React from 'react';
import CVSelector from './CVSelector';
import JobTitleInput from './JobTitleInput';
import JobDescriptionUpload from './JobDescriptionTextInput';
import AnalyzeButton from './AnalyzeButton';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface AnalyzeCVMainContentProps {
  uploadedFiles: {
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  };
  jobTitle: string;
  setJobTitle: (title: string) => void;
  uploading: boolean;
  analyzing: boolean;
  hasCreditsForAI: boolean;
  onCVSelect: (uploadedFile: UploadedFile) => void;
  onJobDescriptionFileUpload: (file: File) => void;
  onJobDescriptionTextSubmit: (text: string) => void;
  onRemoveJobDescription: () => void;
  onAnalysis: () => void;
}

const AnalyzeCVMainContent: React.FC<AnalyzeCVMainContentProps> = ({
  uploadedFiles,
  jobTitle,
  setJobTitle,
  uploading,
  analyzing,
  hasCreditsForAI,
  onCVSelect,
  onJobDescriptionFileUpload,
  onJobDescriptionTextSubmit,
  onRemoveJobDescription,
  onAnalysis
}) => {
  const canAnalyze = uploadedFiles.cv && uploadedFiles.jobDescription;

  return (
    <div className="space-y-6">
      {/* Job Title */}
      <JobTitleInput jobTitle={jobTitle} setJobTitle={setJobTitle} />

      {/* CV Selection */}
      <CVSelector
        onCVSelect={onCVSelect}
        selectedCV={uploadedFiles.cv}
        uploading={uploading}
      />

      {/* Job Description Upload */}
      <JobDescriptionUpload
        uploadedFile={uploadedFiles.jobDescription}
        onFileUpload={onJobDescriptionFileUpload}
        onTextSubmit={onJobDescriptionTextSubmit}
        onRemoveFile={onRemoveJobDescription}
        uploading={uploading}
      />

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

export default AnalyzeCVMainContent;
