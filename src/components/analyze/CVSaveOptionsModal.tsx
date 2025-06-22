
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { VybeButton } from '@/components/design-system/VybeButton';
import { Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CVSaveOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (saveCV: boolean) => void;
  fileName: string;
}

const CVSaveOptionsModal: React.FC<CVSaveOptionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-zapier-orange" />
            Save CV to Profile?
          </DialogTitle>
          <DialogDescription>
            Choose whether to save this CV file to your profile for future use, or continue without saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-caption text-muted-foreground">
            Would you like to save "{fileName}" to your profile for future use?
          </p>
          
          <Alert>
            <AlertDescription className="text-tiny">
              💡 Saving your CV allows you to quickly select it for future analyses without re-uploading.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <VybeButton
            vybeVariant="outline"
            onClick={() => {
              onConfirm(false);
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Don't Save
          </VybeButton>
          <VybeButton
            vybeVariant="primary"
            onClick={() => {
              onConfirm(true);
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save to Profile
          </VybeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CVSaveOptionsModal;
