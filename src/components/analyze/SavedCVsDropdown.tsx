
import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface SavedCVsDropdownProps {
  onCVSelect: (uploadedFile: UploadedFile) => void;
  selectedCV?: UploadedFile;
}

const SavedCVsDropdown: React.FC<SavedCVsDropdownProps> = ({ onCVSelect, selectedCV }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cvs, setCvs] = useState<CVUpload[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
      setCvs(data || []);
    } catch (error) {
      console.error('Error loading saved CVs:', error);
      toast({ title: 'Error', description: 'Failed to load saved CVs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCVSelect = (cv: CVUpload) => {
    // Create a File object from the saved CV data
    const file = new File([cv.extracted_text], cv.file_name, { type: 'application/pdf' });
    
    const uploadedFile: UploadedFile = {
      file,
      extractedText: cv.extracted_text,
      type: 'cv'
    };

    onCVSelect(uploadedFile);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-apricot mx-auto"></div>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 italic">
        No saved CVs available. Upload a CV first.
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
      >
        <span>{selectedCV ? selectedCV.file.name : 'Select from saved CVs'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-blueberry/20 border border-apple-core/30 dark:border-citrus/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {cvs.map((cv) => (
            <button
              key={cv.id}
              onClick={() => handleCVSelect(cv)}
              className="w-full text-left px-3 py-2 hover:bg-apple-core/10 dark:hover:bg-citrus/10 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4 text-apricot" />
              <div>
                <p className="font-medium text-blueberry dark:text-citrus">{cv.file_name}</p>
                <p className="text-xs text-blueberry/70 dark:text-apple-core/80">
                  {new Date(cv.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCVsDropdown;
