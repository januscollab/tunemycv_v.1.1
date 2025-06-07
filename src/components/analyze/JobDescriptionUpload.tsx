
import React, { useState } from 'react';
import FileUploadArea from './upload/FileUploadArea';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import JobDescriptionTextInput from './JobDescriptionTextInput';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';
import DocumentTypeConfirmationModal from '@/components/ui/document-type-confirmation-modal';

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
  const [showTypeConfirmation, setShowTypeConfirmation] = useState(false);
  const [pendingFileData, setPendingFileData] = useState<{
    file: File;
    extractedText: string;
    typeDetection: any;
    qualityAssessment: any;
  } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File, extractedText: string, typeDetection: any, qualityAssessment: any) => {
    // Check if document type confirmation is needed
    if (typeDetection?.needsUserConfirmation) {
      setPendingFileData({ file, extractedText, typeDetection, qualityAssessment });
      setShowTypeConfirmation(true);
      return;
    }

    // Proceed with upload if type is confirmed as job description or highly confident
    if (typeDetection?.detectedType === 'job_description' || typeDetection?.jobDescriptionConfidence >= 70) {
      const uploadedFileData: UploadedFile = {
        file,
        extractedText,
        type: 'job_description'
      };
      onJobDescriptionSet(uploadedFileData);
      toast({ title: 'Success', description: 'Job description uploaded successfully!' });
    } else {
      // Show confirmation for uncertain cases
      setPendingFileData({ file, extractedText, typeDetection, qualityAssessment });
      setShowTypeConfirmation(true);
    }
  };

  const handleTypeConfirmation = (confirmedType: 'cv' | 'job_description') => {
    if (pendingFileData && confirmedType === 'job_description') {
      const uploadedFileData: UploadedFile = {
        file: pendingFileData.file,
        extractedText: pendingFileData.extractedText,
        type: 'job_description'
      };
      onJobDescriptionSet(uploadedFileData);
      toast({ title: 'Success', description: 'Job description uploaded successfully!' });
    } else if (confirmedType === 'cv') {
      toast({ 
        title: 'Wrong document type', 
        description: 'Please upload a job description, not a CV/Resume.', 
        variant: 'destructive' 
      });
    }
    setShowTypeConfirmation(false);
    setPendingFileData(null);
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
      
      {/* Document Type Confirmation Modal */}
      {pendingFileData && (
        <DocumentTypeConfirmationModal
          isOpen={showTypeConfirmation}
          onClose={() => {
            setShowTypeConfirmation(false);
            setPendingFileData(null);
          }}
          fileName={pendingFileData.file.name}
          detectedType={pendingFileData.typeDetection?.detectedType || 'unknown'}
          confidence={pendingFileData.typeDetection?.confidence || 0}
          cvConfidence={pendingFileData.typeDetection?.cvConfidence || 0}
          jobDescriptionConfidence={pendingFileData.typeDetection?.jobDescriptionConfidence || 0}
          onConfirm={handleTypeConfirmation}
        />
      )}
    </div>
  );
};

export default JobDescriptionUpload;
