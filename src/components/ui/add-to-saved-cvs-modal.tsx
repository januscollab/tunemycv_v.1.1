import React, { useState } from 'react';
import { Save, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddToSavedCVsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileContent: string;
  onSuccess?: () => void;
}

const AddToSavedCVsModal: React.FC<AddToSavedCVsModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileContent,
  onSuccess
}) => {
  const [cvName, setCvName] = useState(fileName.replace(/\.[^/.]+$/, '')); // Remove extension
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!cvName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your CV',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save CVs',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      // Save CV to the uploads table as a saved CV
      const { error } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          file_name: cvName.trim(),
          extracted_text: fileContent,
          file_size: new Blob([fileContent]).size,
          file_type: 'text/plain',
          upload_type: 'cv'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'CV saved successfully to your collection'
      });

      onSuccess?.();
      onClose();
      setCvName('');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast({
        title: 'Error',
        description: 'Failed to save CV. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Add to Saved CVs</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Save this CV to your collection for easy access
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Original file:</strong> {fileName}
            </p>
          </div>
          
          <div>
            <Label htmlFor="cv_name" className="text-sm font-medium">
              CV Name *
            </Label>
            <FloatingLabelInput
              id="cv_name"
              label="CV Name"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="Enter a name for this CV..."
              className="mt-1"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your CV a memorable name for easy identification
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !cvName.trim()}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save CV'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToSavedCVsModal;