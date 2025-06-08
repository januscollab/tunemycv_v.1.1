
import React, { useState } from 'react';
import FileUploadArea from './upload/FileUploadArea';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import JobDescriptionTextInput from './JobDescriptionTextInput';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';

interface JobDescriptionUploadProps {
  onJobDescriptionSet: (file: UploadedFile) => void;
  uploadedFile?: UploadedFile;
  disabled?: boolean;
}

const JobDescriptionUpload: React.FC<JobDescriptionUploadProps> = ({
  onJobDescriptionSet,
  uploadedFile,
  disabled = false
}) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File, extractedText: string, typeDetection: any, qualityAssessment: any) => {
    // Always proceed with upload - type detection warnings will be shown in the document preview
    const uploadedFileData: UploadedFile = {
      file,
      extractedText,
      type: 'job_description'
    };
    onJobDescriptionSet(uploadedFileData);
    toast({ title: 'Success', description: 'Job description uploaded successfully!' });
  };

  const handleJobDescriptionText = (text: string) => {
    if (!text.trim()) {
      toast({ title: 'Error', description: 'Please enter job description text', variant: 'destructive' });
      return;
    }

    const textFile = new File([text], 'job-description.txt', { type: 'text/plain' });
    const uploadedFileData: UploadedFile = {
      file: textFile,
      extractedText: text,
      type: 'job_description'
    };

    onJobDescriptionSet(uploadedFileData);
    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = () => {
    // Reset to empty state - parent should handle this
    onJobDescriptionSet(undefined as any);
  };

  const handleVerificationSave = (updatedText: string) => {
    if (!uploadedFile) return;
    
    const updatedFile = new File([updatedText], uploadedFile.file.name, { type: uploadedFile.file.type });
    const updatedUploadedFile: UploadedFile = {
      file: updatedFile,
      extractedText: updatedText,
      type: 'job_description'
    };
    
    onJobDescriptionSet(updatedUploadedFile);
    toast({ title: 'Success', description: 'Job description updated successfully!' });
  };

  if (uploadedFile) {
    return (
      <>
        <DocumentPreviewCard
          fileName={uploadedFile.file.name}
          fileSize={uploadedFile.file.size}
          extractedText={uploadedFile.extractedText}
          documentType="job_description"
          onOpenVerification={() => setShowVerificationModal(true)}
          onRemove={removeFile}
        />
        
        <DocumentVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          fileName={uploadedFile.file.name}
          fileSize={uploadedFile.file.size}
          extractedText={uploadedFile.extractedText}
          documentType="job_description"
          onSave={handleVerificationSave}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* File Upload Option */}
      <FileUploadArea
        onFileSelect={handleFileSelect}
        uploading={false}
        accept=".pdf,.docx,.txt"
        maxSize="5MB"
        label="Upload Job Description"
        fileType="job_description"
      />
      
      <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
      
      <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={disabled} />
    </div>
  );
};

export default JobDescriptionUpload;
