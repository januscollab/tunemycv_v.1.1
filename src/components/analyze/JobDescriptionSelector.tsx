import React, { useState } from 'react';
import { FileText, Edit3, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploadArea from './upload/FileUploadArea';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';
import { supabase } from '@/integrations/supabase/client';

interface JobDescriptionSelectorProps {
  onJobDescriptionSet: (file: UploadedFile) => void;
  uploadedFile?: UploadedFile;
  disabled?: boolean;
}

const JobDescriptionSelector: React.FC<JobDescriptionSelectorProps> = ({
  onJobDescriptionSet,
  uploadedFile,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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

    const textFile = new File([text], 'job-description.txt', { type: 'text/plain' });
    const uploadedFileData: UploadedFile = {
      file: textFile,
      extractedText: text,
      type: 'job_description'
    };

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
      // Don't fail the main process for debug tracking issues
    }

    onJobDescriptionSet(uploadedFileData);
    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = () => {
    // Reset to empty state - parent should handle this
    onJobDescriptionSet(undefined as any);
  };

  const handleVerificationSave = (updatedJson: DocumentJson) => {
    if (!uploadedFile) return;
    
    console.log('[JobDescriptionSelector] Saving updated job description JSON with', updatedJson.sections?.length || 0, 'sections');
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
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-heading font-semibold text-foreground flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          Job Description
        </CardTitle>
        <p className="text-caption text-muted-foreground">
          Upload a file (PDF, DOCX, TXT) or paste the text directly
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-2 text-caption font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'paste'
                  ? 'text-primary border-b-2 border-primary bg-transparent'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
              disabled={disabled}
            >
              <Edit3 className="h-4 w-4" />
              <span>Paste Job Description</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-2 text-caption font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'upload'
                  ? 'text-primary border-b-2 border-primary bg-transparent'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
              disabled={disabled}
            >
              <Upload className="h-4 w-4" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'paste' ? (
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
              disabled={disabled}
              maxLength={10000}
              description="Enter at least 50 characters to proceed"
            />
          ) : (
            <FileUploadArea
              onFileSelect={handleFileSelect}
              uploading={false}
              accept=".pdf,.docx,.txt"
              maxSize="5MB"
              label="Upload Job Description"
              fileType="job_description"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDescriptionSelector;