
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import CVSelectorDropdown from './CVSelectorDropdown';
import FileUploadWithSave from './upload/FileUploadWithSave';
import UploadedFileDisplay from './upload/UploadedFileDisplay';

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
  const [savedCVs, setSavedCVs] = useState<CVUpload[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedCVs();
    }
  }, [user]);

  const loadSavedCVs = async () => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('id, file_name, file_size, created_at, extracted_text')
        .eq('user_id', user?.id)
        .eq('upload_type', 'cv')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCVs(data || []);
    } catch (error) {
      console.error('Error loading saved CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavedCVSelect = (cv: CVUpload) => {
    setSelectedCVId(cv.id);
    const mockFile = new File([''], cv.file_name, { type: 'application/pdf' });
    const uploadedFile: UploadedFile = {
      file: mockFile,
      extractedText: cv.extracted_text,
      type: 'cv'
    };
    onCVSelect(uploadedFile);
  };

  const handleNewFileUpload = async (file: File, shouldSave: boolean) => {
    const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const errors = validateFile(file, cvTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      const extractedText = await extractTextFromFile(file);
      
      // Save to database if requested and user is logged in
      if (shouldSave && user) {
        const { error } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            upload_type: 'cv',
            extracted_text: extractedText
          });

        if (error) throw error;
        
        // Reload saved CVs
        await loadSavedCVs();
        toast({ 
          title: 'Success', 
          description: 'CV uploaded and saved successfully!',
          className: 'bg-green-50 border-green-200'
        });
      } else {
        toast({ 
          title: 'Success', 
          description: 'CV uploaded successfully!',
          className: 'bg-green-50 border-green-200'
        });
      }

      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };
      setSelectedCVId(null);
      onCVSelect(uploadedFile);
    } catch (error) {
      console.error('Error processing CV:', error);
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Select Your CV</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Choose from your saved CVs or upload a new one
      </p>

      <FileUploadWithSave
        onFileSelect={handleNewFileUpload}
        uploading={uploading}
        accept=".pdf,.docx"
        maxSize="5MB"
        label="Upload a new CV"
        currentCVCount={savedCVs.length}
        maxCVCount={5}
      />

      {selectedCV && !selectedCVId && (
        <UploadedFileDisplay
          uploadedFile={selectedCV}
          title="New upload ready for analysis"
        />
      )}

      {savedCVs.length > 0 && (
        <div className="mt-6">
          <CVSelectorDropdown
            savedCVs={savedCVs}
            selectedCVId={selectedCVId}
            onCVSelect={handleSavedCVSelect}
          />
        </div>
      )}
    </div>
  );
};

export default CVSelector;
