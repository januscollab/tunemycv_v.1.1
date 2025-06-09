import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StorageOptions {
  uploadType: 'cv' | 'job_description';
  extractedText?: string;
  prettyJsonString?: string;
}

export const useFileStorage = () => {
  const [isStoring, setIsStoring] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const storeFile = async (file: File, options: StorageOptions): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Storage failed",
        description: "User not authenticated",
        variant: "destructive"
      });
      return false;
    }

    setIsStoring(true);
    
    try {
      // Convert original file to base64 for storage
      const fileContent = await file.arrayBuffer();
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('save-primary-upload', {
        body: {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type,
          uploadType: options.uploadType,
          userId: user.id,
          extractedText: options.extractedText,
          documentJson: options.prettyJsonString
        }
      });

      if (error) {
        console.error('File storage failed:', error);
        toast({
          title: "Storage failed",
          description: "Failed to save file to uploads table",
          variant: "destructive"
        });
        return false;
      }

      console.log('File stored successfully:', data);
      return true;
      
    } catch (error) {
      console.error('File storage error:', error);
      // Don't show error to user as this is debug storage only
      // The main upload continues successfully even if debug storage fails
      console.warn('Debug file storage failed, continuing with upload process');
      return false;
    } finally {
      setIsStoring(false);
    }
  };

  return {
    isStoring,
    storeFile
  };
};