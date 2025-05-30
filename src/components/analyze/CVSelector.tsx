
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';

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

  const handleNewFileUpload = async (file: File) => {
    const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const errors = validateFile(file, cvTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      const extractedText = await extractTextFromFile(file);
      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };
      setSelectedCVId(null);
      onCVSelect(uploadedFile);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Select Your CV</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Choose from your saved CVs or upload a new one
      </p>

      {/* Saved CVs */}
      {!loading && savedCVs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
          <div className="space-y-2">
            {savedCVs.map((cv) => (
              <div
                key={cv.id}
                onClick={() => handleSavedCVSelect(cv)}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCVId === cv.id
                    ? 'border-apricot bg-apricot/10'
                    : 'border-apple-core/20 dark:border-citrus/20 hover:border-apricot hover:bg-apricot/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-apricot" />
                  <div>
                    <p className="font-medium text-blueberry dark:text-citrus">{cv.file_name}</p>
                    <p className="text-xs text-blueberry/70 dark:text-apple-core/80">
                      {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedCVId === cv.id && (
                  <Check className="h-5 w-5 text-apricot" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New CV */}
      <div className="text-center text-blueberry/60 dark:text-apple-core/60 mb-4">
        {savedCVs.length > 0 ? 'or' : ''}
      </div>

      <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
        <label className="cursor-pointer">
          <span className="text-apricot hover:text-apricot/80 font-medium">Upload a new CV</span>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">PDF or DOCX, max 5MB</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={(e) => e.target.files?.[0] && handleNewFileUpload(e.target.files[0])}
            disabled={uploading}
          />
        </label>
      </div>

      {selectedCV && !selectedCVId && (
        <div className="mt-4 flex items-center justify-between p-3 bg-apricot/10 border border-apricot/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-apricot" />
            <div>
              <p className="font-medium text-blueberry dark:text-citrus">{selectedCV.file.name}</p>
              <p className="text-xs text-blueberry/70 dark:text-apple-core/80">New upload ready for analysis</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVSelector;
