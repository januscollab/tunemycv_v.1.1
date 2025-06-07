
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Check, X, Plus, FolderOpen, FilePlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import FileUploadWithSave from './upload/FileUploadWithSave';
import SavedCVList from './upload/SavedCVList';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import DocumentVerificationModal from '@/components/documents/DocumentVerificationModal';
import DocumentValidationDialog from '@/components/ui/document-validation-dialog';
import { validateCV } from '@/utils/documentValidation';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

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

    // Check if we're at the 5 CV limit when trying to save
    if (shouldSave && savedCVs.length >= 5) {
      toast({ title: 'Limit Reached', description: 'You can save up to 5 CVs. Please delete one first.', variant: 'destructive' });
      return;
    }

    try {
      setFileUploading(true);
      
      // Only save to database if user explicitly requested it AND we're under the limit
      if (shouldSave && user?.id && savedCVs.length < 5) {
        const { error: saveError } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            upload_type: 'cv',
            extracted_text: extractedText
          });

        if (saveError) {
          console.error('Error saving CV:', saveError);
          toast({ title: 'Warning', description: 'CV uploaded but not saved for future use', variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'CV uploaded and saved for future use!' });
          // Refetch saved CVs to update the list
          refetch();
        }
      } else if (!shouldSave) {
        toast({ title: 'Success', description: 'CV uploaded for one-time use!' });
      }

      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };

      onCVSelect(uploadedFile);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process CV file', variant: 'destructive' });
    } finally {
      setFileUploading(false);
    }
  };

  const handleValidationConfirm = async () => {
    if (pendingFile) {
      // User confirmed, proceed with upload using existing logic
      const shouldSave = false; // Default to not saving when validation failed
      await finalizeUpload(pendingFile.file, pendingFile.extractedText, shouldSave);
    }
    setShowValidationDialog(false);
    setPendingFile(null);
  };

  const handleValidationCancel = () => {
    setShowValidationDialog(false);
    setPendingFile(null);
  };

  const finalizeUpload = async (file: File, extractedText: string, shouldSave: boolean) => {
    // Check if we're at the 5 CV limit when trying to save
    if (shouldSave && savedCVs.length >= 5) {
      toast({ title: 'Limit Reached', description: 'You can save up to 5 CVs. Please delete one first.', variant: 'destructive' });
      return;
    }

    try {
      setFileUploading(true);
      
      // Only save to database if user explicitly requested it AND we're under the limit
      if (shouldSave && user?.id && savedCVs.length < 5) {
        const { error: saveError } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            upload_type: 'cv',
            extracted_text: extractedText
          });

        if (saveError) {
          console.error('Error saving CV:', saveError);
          toast({ title: 'Warning', description: 'CV uploaded but not saved for future use', variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'CV uploaded and saved for future use!' });
          // Refetch saved CVs to update the list
          refetch();
        }
      } else if (!shouldSave) {
        toast({ title: 'Success', description: 'CV uploaded for one-time use!' });
      }

      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };

      onCVSelect(uploadedFile);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process CV file', variant: 'destructive' });
    } finally {
      setFileUploading(false);
    }
  };

  const handleVerificationSave = (updatedText: string) => {
    if (!selectedCV) return;
    
    const updatedFile = new File([updatedText], selectedCV.file.name, { type: selectedCV.file.type });
    const updatedUploadedFile: UploadedFile = {
      file: updatedFile,
      extractedText: updatedText,
      type: 'cv'
    };
    
    onCVSelect(updatedUploadedFile);
    toast({ title: 'Success', description: 'CV updated successfully!' });
  };

  return (
    <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
      <CardHeader>
        <CardTitle className="text-heading font-semibold text-blueberry dark:text-citrus flex items-center">
          <FileText className="h-5 w-5 text-apricot mr-2" />
          Your CV
        </CardTitle>
        <p className="text-body text-blueberry/70 dark:text-apple-core/80">
          Upload a new CV or select from your saved CVs. 
          <Link 
            to="/profile?tab=files" 
            className="text-apricot hover:text-apricot/80 ml-1 underline"
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
              onSaveToCVs={async () => {
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
              canSaveToCVs={savedCVs.length < 5}
            />
            
            <DocumentVerificationModal
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              fileName={selectedCV.file.name}
              fileSize={selectedCV.file.size}
              extractedText={selectedCV.extractedText}
              documentType="cv"
              onSave={handleVerificationSave}
            />
          </>
        ) : (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-2 bg-apple-core/10 dark:bg-citrus/10 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'saved'
                    ? 'text-zapier-orange border-b-2 border-zapier-orange bg-transparent'
                    : 'text-blueberry/70 dark:text-apple-core/70 hover:bg-apple-core/10 dark:hover:bg-citrus/10'
                }`}
                disabled={uploading || isLoading}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Saved CVs ({savedCVs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'upload'
                    ? 'text-zapier-orange border-b-2 border-zapier-orange bg-transparent'
                    : 'text-blueberry/70 dark:text-apple-core/70 hover:bg-apple-core/10 dark:hover:bg-citrus/10'
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
