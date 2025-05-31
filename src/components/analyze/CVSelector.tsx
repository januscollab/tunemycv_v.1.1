
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import FileUploadWithSave from './upload/FileUploadWithSave';
import SavedCVList from './upload/SavedCVList';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'saved'>('saved');
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);

  // Fetch saved CVs from database
  const { data: savedCVs = [], isLoading } = useQuery({
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
    
    // Convert CV to UploadedFile format
    const textFile = new File([cv.extracted_text], cv.file_name, { type: 'application/pdf' });
    const uploadedFile: UploadedFile = {
      file: textFile,
      extractedText: cv.extracted_text,
      type: 'cv'
    };
    
    onCVSelect(uploadedFile);
  };

  return (
    <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus">Your CV</CardTitle>
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
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
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{selectedCV.file.name}</p>
                <p className="text-sm text-green-700">CV ready for analysis</p>
              </div>
            </div>
            <button
              onClick={() => {
                window.location.reload(); // Simple way to reset without complex state management
              }}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-apple-core/20 dark:bg-citrus/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-blueberry/40 text-blueberry dark:text-citrus shadow-sm'
                    : 'text-blueberry/70 dark:text-apple-core/70 hover:text-blueberry dark:hover:text-citrus'
                }`}
                disabled={uploading || isLoading}
              >
                <FileText className="h-4 w-4 mx-auto mb-1" />
                Saved CVs ({savedCVs.length})
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-blueberry/40 text-blueberry dark:text-citrus shadow-sm'
                    : 'text-blueberry/70 dark:text-apple-core/70 hover:text-blueberry dark:hover:text-citrus'
                }`}
                disabled={uploading || isLoading}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Upload New
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
              <FileUploadWithSave onCVSelect={onCVSelect} uploading={uploading} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVSelector;
