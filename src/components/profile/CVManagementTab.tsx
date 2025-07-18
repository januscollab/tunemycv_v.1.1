import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Edit, Pencil } from 'lucide-react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
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
  processing_status: string;
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
        .select('id, file_name, file_size, created_at, extracted_text, processing_status')
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
      
      let extractedText = '';
      let originalFileContent = null;
      let processingStatus = 'completed';

      if (file.type === 'application/pdf') {
        // For PDFs, store raw content and process later with Adobe API
        const arrayBuffer = await file.arrayBuffer();
        originalFileContent = Array.from(new Uint8Array(arrayBuffer));
        processingStatus = 'uploaded';
        
        // Try local extraction as fallback
        try {
          extractedText = await extractTextFromFile(file);
        } catch (error) {
          console.log('Local PDF extraction failed, will use Adobe API:', error);
        }
      } else {
        // For DOCX files, extract text immediately
        extractedText = await extractTextFromFile(file);
      }
      
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          upload_type: 'cv',
          extracted_text: extractedText || null,
          original_file_content: originalFileContent,
          processing_status: processingStatus
        })
        .select()
        .single();

      if (error) throw error;

      // Also save to debug tracking system
      try {
        const fileContent = await file.arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
        
        await supabase.functions.invoke('save-user-upload', {
          body: {
            fileContent: base64Content,
            fileName: file.name,
            fileType: file.type,
            uploadType: 'cv',
            userId: user?.id
          }
        });
      } catch (debugError) {
        console.warn('Debug file tracking failed:', debugError);
        // Don't fail the main upload for debug tracking issues
      }

      setCvs(prev => [data, ...prev]);
      
      if (processingStatus === 'uploaded') {
        toast({ 
          title: 'Upload Successful', 
          description: 'PDF uploaded! Text extraction will complete in the background.' 
        });
        
        // Trigger background processing
        try {
          await supabase.functions.invoke('adobe-background-process', {
            body: { uploadId: data.id }
          });
        } catch (bgError) {
          console.error('Background processing trigger failed:', bgError);
        }
      } else {
        toast({ title: 'Success', description: 'CV uploaded successfully!' });
      }
      
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

  const retryProcessing = async (cvId: string) => {
    try {
      // Reset status to uploaded
      const { error: updateError } = await supabase
        .from('uploads')
        .update({ processing_status: 'uploaded' })
        .eq('id', cvId)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Trigger background processing
      await supabase.functions.invoke('adobe-background-process', {
        body: { uploadId: cvId }
      });

      // Refresh the list
      loadCVs();
      
      toast({ title: 'Processing Retry', description: 'PDF processing has been restarted' });
    } catch (error) {
      console.error('Error retrying processing:', error);
      toast({ title: 'Error', description: 'Failed to retry processing', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-title font-semibold text-foreground">My CVs</h2>
        <span className="text-caption text-muted-foreground">{cvs.length}/5 CVs uploaded</span>
      </div>
      
      {cvs.length < 5 && (
        <div className="mb-6">
          <DragDropZone
            onDrop={(files) => handleFileUpload(files[0])}
            accept=".pdf,.docx"
            maxSize={5 * 1024 * 1024}
            disabled={uploading}
            placeholder={uploading ? "Uploading..." : "Upload New CV"}
            description="PDF or DOCX • Max 5MB"
            className="border-border hover:border-primary hover:bg-primary/5"
          />
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-heading font-medium text-foreground mb-2">No CVs uploaded</h3>
          <p className="text-muted-foreground">
            Upload your first CV to get started with analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map((cv) => (
            <div key={cv.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground">{cv.file_name}</h3>
                        <button
                          onClick={() => setEditingCV(cv)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit CV name"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {}}
                      className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="Edit CV (future functionality)"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  <button
                    onClick={() => deleteCV(cv.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
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
