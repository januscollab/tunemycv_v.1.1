
import React, { useState } from 'react';
import { Upload, FileText, Check, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';
import { useQuery } from '@tanstack/react-query';

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

interface CVUploadSectionProps {
  onCVSelect: (uploadedFile: UploadedFile) => void;
  selectedCV?: UploadedFile;
  uploading: boolean;
}

const CVUploadSection: React.FC<CVUploadSectionProps> = ({ onCVSelect, selectedCV, uploading }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [saveNewCV, setSaveNewCV] = useState(true);

  const { data: savedCVs = [], refetch } = useQuery({
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

  const handleSavedCVSelect = async (cvId: string) => {
    const cv = savedCVs.find(c => c.id === cvId);
    if (!cv) return;

    setSelectedCVId(cvId);
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

    if (saveNewCV && savedCVs.length >= 5) {
      toast({ 
        title: 'CV Limit Reached', 
        description: 'You can store up to 5 CVs. Please manage your CVs in your profile to add new ones.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const extractedText = await extractTextFromFile(file);
      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type: 'cv'
      };

      // Save to database if user wants to store it
      if (saveNewCV) {
        const { error } = await supabase
          .from('uploads')
          .insert({
            user_id: user?.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            upload_type: 'cv',
            extracted_text: extractedText
          });

        if (error) {
          console.error('Error saving CV:', error);
        } else {
          refetch();
          toast({ title: 'Success', description: 'CV uploaded and saved successfully!' });
        }
      } else {
        toast({ title: 'Success', description: 'CV uploaded successfully!' });
      }

      setSelectedCVId(null);
      onCVSelect(uploadedFile);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Upload Your CV</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Upload a new CV or select from your saved CVs
      </p>

      {/* Upload New CV */}
      <div className="mb-6">
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
        
        {/* Save CV Checkbox */}
        <div className="mt-3 flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveCV"
            checked={saveNewCV}
            onChange={(e) => setSaveNewCV(e.target.checked)}
            className="rounded border-apple-core/30 text-apricot focus:ring-apricot"
          />
          <label htmlFor="saveCV" className="text-sm text-blueberry/70 dark:text-apple-core/80">
            Save this CV to my profile ({savedCVs.length}/5 stored)
          </label>
        </div>
      </div>

      {/* Saved CVs Dropdown */}
      {savedCVs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
          <Select value={selectedCVId || ''} onValueChange={handleSavedCVSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a saved CV" />
            </SelectTrigger>
            <SelectContent>
              {savedCVs.map((cv) => (
                <SelectItem key={cv.id} value={cv.id}>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-apricot" />
                    <div>
                      <span className="font-medium">{cv.file_name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedCV && !selectedCVId && (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{selectedCV.file.name}</p>
              <p className="text-xs text-green-700">New upload ready for analysis</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVUploadSection;
