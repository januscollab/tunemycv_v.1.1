
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CVSelectorDropdown from './CVSelectorDropdown';
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
  file_type: string;
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
  const [savedCVs, setSavedCVs] = useState<CVUpload[]>([]);
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
        .select('id, file_name, file_size, created_at, extracted_text, file_type')
        .eq('user_id', user?.id)
        .eq('upload_type', 'cv')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCVs(data || []);
    } catch (error) {
      console.error('Error loading saved CVs:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load saved CVs', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCVSelect = (cv: CVUpload) => {
    // Convert CV data to UploadedFile format
    const uploadedFile: UploadedFile = {
      file: new File([cv.extracted_text || ''], cv.file_name, { type: cv.file_type }),
      extractedText: cv.extracted_text || '',
      type: 'cv'
    };
    onCVSelect(uploadedFile);
  };

  const handleFileSelect = async (file: File, shouldSave: boolean) => {
    try {
      // Extract text from file (this would normally be done by a service)
      const extractedText = await extractTextFromFile(file);
      
      const uploadedFile: UploadedFile = {
        file: file,
        extractedText: extractedText,
        type: 'cv'
      };
      
      // If shouldSave is true, save the CV to the backend
      if (shouldSave) {
        console.log('Saving CV to backend...', file.name);
        await saveCVToBackend(file, extractedText);
        // Reload saved CVs after saving
        await loadSavedCVs();
      }
      
      onCVSelect(uploadedFile);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to process file', 
        variant: 'destructive' 
      });
    }
  };

  // Mock text extraction function - in real app this would call a service
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // This is a simplified extraction - real app would use proper PDF/DOCX parsing
        const text = e.target?.result as string;
        resolve(text || `Extracted text from ${file.name}...`);
      };
      reader.readAsText(file);
    });
  };

  const saveCVToBackend = async (file: File, extractedText: string) => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          upload_type: 'cv',
          extracted_text: extractedText
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving CV:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus">Your CV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apricot"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              onClick={() => window.location.reload()} // Simple way to reset without complex state management
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
                disabled={uploading}
              >
                <FileText className="h-4 w-4 mx-auto mb-1" />
                Saved CVs
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-blueberry/40 text-blueberry dark:text-citrus shadow-sm'
                    : 'text-blueberry/70 dark:text-apple-core/70 hover:text-blueberry dark:hover:text-citrus'
                }`}
                disabled={uploading}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Upload New
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'saved' ? (
              savedCVs.length > 0 ? (
                <SavedCVList 
                  savedCVs={savedCVs} 
                  selectedCVId={null} 
                  onCVSelect={handleCVSelect} 
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-blueberry/40 dark:text-apple-core/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blueberry dark:text-citrus mb-2">No Saved CVs</h3>
                  <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
                    You haven't saved any CVs yet. Upload a CV and choose to save it for future use.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-apricot hover:bg-apricot/90"
                  >
                    Upload Your First CV
                  </Button>
                </div>
              )
            ) : (
              <FileUploadWithSave 
                onFileSelect={handleFileSelect}
                uploading={uploading}
                accept=".pdf,.docx,.txt"
                maxSize="5MB"
                label="Upload your CV"
                currentCVCount={savedCVs.length}
                maxCVCount={5}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVSelector;
