
import React, { useState } from 'react';
import FileUploadArea from './upload/FileUploadArea';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { supabase } from '@/integrations/supabase/client';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (file: File, extractedText: string, documentJson: any, typeDetection: any, qualityAssessment: any) => {
    // Always proceed with upload - type detection warnings will be shown in the document preview
    const uploadedFileData: UploadedFile = {
      file,
      extractedText,
      type: 'job_description',
      documentJson,
      typeDetection,
      qualityAssessment
    } as any;
    onJobDescriptionSet(uploadedFileData);
    toast({ title: 'Success', description: 'Job description uploaded successfully!' });
  };

  const handleJobDescriptionText = async (text: string) => {
    if (!text.trim()) {
      toast({ title: 'Error', description: 'Please enter job description text', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing with progress updates
      setProcessingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      const textFile = new File([text], 'job-description.txt', { type: 'text/plain' });
      
      setProcessingProgress(40);
      await new Promise(resolve => setTimeout(resolve, 300));

      const uploadedFileData: UploadedFile = {
        file: textFile,
        extractedText: text,
        type: 'job_description'
      };

      setProcessingProgress(60);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Save to debug tracking system for job descriptions
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.functions.invoke('save-job-description', {
            body: {
              content: text,
              jobTitle: 'Pasted Job Description',
              companyName: 'Unknown Company',
              userId: user.id
            }
          });
        }
      } catch (debugError) {
        console.warn('Debug job description tracking failed:', debugError);
      }

      setProcessingProgress(80);
      await new Promise(resolve => setTimeout(resolve, 200));

      onJobDescriptionSet(uploadedFileData);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 500);

      toast({ title: 'Success', description: 'Job description added successfully!' });
    } catch (error) {
      console.error('Error processing job description:', error);
      toast({ title: 'Error', description: 'Failed to process job description', variant: 'destructive' });
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const removeFile = () => {
    // Reset to empty state - parent should handle this
    onJobDescriptionSet(undefined as any);
  };

  const handleVerificationSave = (updatedJson: DocumentJson) => {
    if (!uploadedFile) return;
    
    console.log('[JobDescriptionUpload] Saving updated job description JSON with', updatedJson.sections?.length || 0, 'sections');
    const updatedText = generateFormattedText(updatedJson);
    const updatedFile = new File([updatedText], uploadedFile.file.name, { type: uploadedFile.file.type });
    const updatedUploadedFile: UploadedFile = {
      file: updatedFile,
      extractedText: updatedText,
      documentJson: updatedJson,
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
          documentJson={(uploadedFile as any).documentJson}
          showDebugTools={true}
        />
        
        <DocumentVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          fileName={uploadedFile.file.name}
          fileSize={uploadedFile.file.size}
          documentJson={uploadedFile.documentJson || textToJson(uploadedFile.extractedText)}
          documentType="job_description"
          onSave={handleVerificationSave}
          extractedText={uploadedFile.extractedText}
        />
      </>
    );
  }

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-modal">
          <ProgressIndicator 
            value={processingProgress}
            variant="default"
            size="lg"
            label="Processing Job Description"
            showPercentage={true}
          />
        </div>
      )}
      
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
        
        <CaptureTextarea
          label="Job Description"
          value=""
          onChange={(e) => {
            const text = e.target.value;
            if (text.length >= 50) {
              handleJobDescriptionText(text);
            }
          }}
          placeholder="Paste the job description here... (minimum 50 characters)"
          className="min-h-[120px]"
          disabled={disabled || isProcessing}
          maxLength={10000}
          description="Enter at least 50 characters to proceed"
        />
      </div>
    </>
  );
};

export default JobDescriptionUpload;
