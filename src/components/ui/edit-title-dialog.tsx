import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditTitleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  currentTitle: string;
  titleType: 'analysis' | 'cover-letter';
}

const EditTitleDialog: React.FC<EditTitleDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTitle,
  titleType
}) => {
  const [title, setTitle] = useState(currentTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] bg-white border-border">
        <DialogHeader>
          <DialogTitle className="text-earth font-semibold">
            Edit {titleType === 'analysis' ? 'Analysis' : 'Cover Letter'} Title
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-earth">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 border-border focus:ring-zapier-orange focus:border-zapier-orange"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
                if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="border-border text-earth hover:bg-cream"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="bg-zapier-orange hover:bg-zapier-orange/90 text-white"
            disabled={!title.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTitleDialog;