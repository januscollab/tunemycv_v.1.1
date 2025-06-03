import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Edit, Plus, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';
import CVEditModal from './CVEditModal';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface CVManagementTabProps {
  credits: number;
  memberSince: string;
}

const CVManagementTab: React.FC<CVManagementTabProps> = ({ credits, memberSince }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cvs, setCvs] = useState<CVUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingCV, setEditingCV] = useState<CVUpload | null>(null);

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
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
      console.error('Error loading CVs:', error);
      toast({ title: 'Error', description: 'Failed to load CVs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (cvs.length >= 5) {
      toast({ title: 'Limit Reached', description: 'You can upload up to 5 CV versions', variant: 'destructive' });
      return;
    }

    const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const errors = validateFile(file, cvTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const extractedText = await extractTextFromFile(file);
      
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

      setCvs(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'CV uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({ title: 'Error', description: 'Failed to upload CV', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const deleteCV = async (cvId: string) => {
    try {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', cvId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCvs(prev => prev.filter(cv => cv.id !== cvId));
      toast({ title: 'Success', description: 'CV deleted successfully' });
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({ title: 'Error', description: 'Failed to delete CV', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apricot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-citrus">My CVs</h2>
        <span className="text-sm text-slate-600 dark:text-apple-core/80">{cvs.length}/5 CVs uploaded</span>
      </div>
      
      {cvs.length < 5 && (
        <div className="mb-6">
          <label className="cursor-pointer">
            <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center hover:border-apricot hover:bg-apricot/5 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-slate-600 dark:text-apple-core/60 mb-2" />
              <p className="text-slate-900 dark:text-apple-core font-medium">
                {uploading ? 'Uploading...' : 'Upload New CV'}
              </p>
              <p className="text-sm text-slate-600 dark:text-apple-core/80 mt-1">
                PDF or DOCX, max 5MB
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-blueberry/40 dark:text-apple-core/40 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-citrus mb-2">No CVs uploaded</h3>
          <p className="text-slate-600 dark:text-apple-core/80">
            Upload your first CV to get started with analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map((cv) => (
            <div key={cv.id} className="border border-apple-core/20 dark:border-citrus/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-apricot" />
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-citrus">{cv.file_name}</h3>
                    <p className="text-sm text-slate-600 dark:text-apple-core/80">
                      {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCV(cv)}
                    className="p-2 text-zapier-orange hover:bg-zapier-orange/10 rounded-md transition-colors"
                    title="Edit CV name"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCV(cv.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete CV"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCV && (
        <CVEditModal
          cv={editingCV}
          onClose={() => setEditingCV(null)}
          onUpdate={loadCVs}
        />
      )}
    </div>
  );
};

export default CVManagementTab;
