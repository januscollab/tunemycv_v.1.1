
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
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
  const [uploading, setUploading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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
      <DragDropZone
        onDrop={(files) => handleFileUpload(files[0])}
        accept=".pdf,.docx,.txt"
        maxSize={maxSize}
        disabled={uploading || disabled}
        placeholder={uploading ? "Processing file..." : "Upload Job Description"}
        description="PDF, DOCX, TXT • Max 5MB"
        className="border-apple-core/30 dark:border-citrus/30"
      />
      
      <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
      
      <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading || disabled} />
    </div>
  );
};

export default JobDescriptionUpload;
