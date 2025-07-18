
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Check, X, Plus, FolderOpen, FilePlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import FileUploadWithSave from './upload/FileUploadWithSave';
import SavedCVList from './upload/SavedCVList';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';
import DocumentValidationDialog from '@/components/ui/document-validation-dialog';
import { validateCV } from '@/utils/documentValidation';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface CVSelectorProps {
  onCVSelect: (uploadedFile: UploadedFile) => void;
  selectedCV?: UploadedFile;
  uploading: boolean;
}

const CVSelector: React.FC<CVSelectorProps> = ({ onCVSelect, selectedCV, uploading }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'saved'>('saved');
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; extractedText: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch saved CVs from database
  const { data: savedCVs = [], isLoading, refetch } = useQuery({
    queryKey: ['saved-cvs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('uploads')
        .select('id, file_name, file_size, created_at, extracted_text')
        .eq('user_id', user.id)
        .eq('upload_type', 'cv')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleSavedCVSelect = (cv: CVUpload) => {
    setSelectedCVId(cv.id);
    
    // Convert CV to UploadedFile format - DO NOT re-save existing CVs
    const textFile = new File([cv.extracted_text], cv.file_name, { type: 'application/pdf' });
    const uploadedFile: UploadedFile = {
      file: textFile,
      extractedText: cv.extracted_text,
      type: 'cv'
    };
    
    onCVSelect(uploadedFile);
    toast({ title: 'Success', description: 'CV selected from saved CVs!' });
  };

  const handleFileUpload = async (file: File, extractedText: string, shouldSave: boolean) => {
    const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const errors = validateFile(file, cvTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    // Validate if this looks like a CV
    const validation = validateCV(extractedText, file.name);
    
    if (!validation.isValid) {
      setPendingFile({ file, extractedText });
      setShowValidationDialog(true);
      return;
    }

    // NEVER automatically save - only proceed with file processing
    await finalizeUpload(file, extractedText, false); // Always pass false for shouldSave
  };

  const handleValidationConfirm = async () => {
    if (pendingFile) {
      // User confirmed, proceed with upload but don't auto-save
      await finalizeUpload(pendingFile.file, pendingFile.extractedText, false);
    }
    setShowValidationDialog(false);
    setPendingFile(null);
  };

  const handleValidationCancel = () => {
    setShowValidationDialog(false);
    setPendingFile(null);
  };

  const finalizeUpload = async (file: File, extractedText: string, shouldSave: boolean) => {
    try {
      setFileUploading(true);
      
      // REMOVED: All automatic save logic - files are only uploaded for analysis, not saved
      // The only way to save is through the explicit "Save to CVs" button in DocumentPreviewCard
      
      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };

      onCVSelect(uploadedFile);
      toast({ title: 'Success', description: 'CV uploaded for analysis!' });
      
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process CV file', variant: 'destructive' });
    } finally {
      setFileUploading(false);
    }
  };

  const handleVerificationSave = (updatedJson: DocumentJson) => {
    if (!selectedCV) return;
    
    console.log('[CVSelector] Saving updated CV JSON with', updatedJson.sections?.length || 0, 'sections');
    const updatedText = generateFormattedText(updatedJson);
    const updatedFile = new File([updatedText], selectedCV.file.name, { type: selectedCV.file.type });
    const updatedUploadedFile: UploadedFile = {
      file: updatedFile,
      extractedText: updatedText,
      documentJson: updatedJson,
      type: 'cv'
    };
    
    onCVSelect(updatedUploadedFile);
    toast({ title: 'Success', description: 'CV updated successfully!' });
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-heading font-semibold text-foreground flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          Your CV
        </CardTitle>
        <p className="text-caption text-muted-foreground">
          Upload a new CV or select from your saved CVs. 
          <Link 
            to="/profile?tab=files" 
            className="text-primary hover:text-primary/80 ml-1 underline"
          >
            Manage your CVs in your Profile
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        {selectedCV ? (
          <>
            <DocumentPreviewCard
              fileName={selectedCV.file.name}
              fileSize={selectedCV.file.size}
              extractedText={selectedCV.extractedText}
              documentType="cv"
              onOpenVerification={() => setShowVerificationModal(true)}
              onRemove={() => window.location.reload()}
              onSaveToCVs={selectedCVId ? undefined : async () => {
                if (user?.id && savedCVs.length < 5) {
                  try {
                    const { error: saveError } = await supabase
                      .from('uploads')
                      .insert({
                        user_id: user.id,
                        file_name: selectedCV.file.name,
                        file_type: selectedCV.file.type,
                        file_size: selectedCV.file.size,
                        upload_type: 'cv',
                        extracted_text: selectedCV.extractedText
                      });

                    if (saveError) {
                      toast({ title: 'Error', description: 'Failed to save CV', variant: 'destructive' });
                    } else {
                      toast({ title: 'Success', description: 'CV added to your saved CVs!' });
                      refetch();
                    }
                  } catch (error) {
                    toast({ title: 'Error', description: 'Failed to save CV', variant: 'destructive' });
                  }
                } else if (savedCVs.length >= 5) {
                  toast({ title: 'Limit Reached', description: 'You can save up to 5 CVs. Please delete one first.', variant: 'destructive' });
                }
              }}
              canSaveToCVs={!selectedCVId && savedCVs.length < 5}
            />
            
            <DocumentVerificationModal
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              fileName={selectedCV.file.name}
              fileSize={selectedCV.file.size}
              documentJson={selectedCV.documentJson || textToJson(selectedCV.extractedText)}
              documentType="cv"
              onSave={handleVerificationSave}
              extractedText={selectedCV.extractedText}
            />
          </>
        ) : (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-2 text-caption font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'saved'
                    ? 'text-primary border-b-2 border-primary bg-transparent'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                disabled={uploading || isLoading}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Saved CVs ({savedCVs.length})</span>
              </button>
              <button
                onClick={() => {
                  // If switching from saved CVs to upload, auto-open file dialog
                  if (activeTab === 'saved') {
                    setActiveTab('upload');
                    // Delay to ensure the tab content has rendered
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 100);
                  } else {
                    setActiveTab('upload');
                  }
                }}
                className={`px-3 py-2 text-caption font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'upload'
                    ? 'text-primary border-b-2 border-primary bg-transparent'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                disabled={uploading || isLoading}
              >
                <FilePlus className="h-4 w-4" />
                <span>Upload New CV</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'saved' ? (
              <SavedCVList 
                savedCVs={savedCVs}
                selectedCVId={selectedCVId}
                onCVSelect={handleSavedCVSelect}
              />
            ) : (
              <FileUploadWithSave 
                onFileSelect={handleFileUpload}
                uploading={fileUploading || uploading}
                accept=".pdf,.docx,.txt"
                maxSize="5MB"
                label="Upload your CV"
                currentCVCount={savedCVs.length}
                maxCVCount={5}
                fileInputRef={fileInputRef}
              />
            )}
          </div>
        )}
        
        {/* Validation Dialog */}
        {pendingFile && (
          <DocumentValidationDialog
            isOpen={showValidationDialog}
            onClose={handleValidationCancel}
            onConfirm={handleValidationConfirm}
            documentType="cv"
            fileName={pendingFile.file.name}
            validationResult={validateCV(pendingFile.extractedText, pendingFile.file.name)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CVSelector;
