import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UnifiedInput } from '@/components/ui/unified-input';
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

  // Update title when currentTitle changes
  React.useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

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
      <DialogContent 
        className="sm:max-w-[400px] bg-white border-gray-200 shadow-lg"
        onInteractOutside={handleCancel}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Edit {titleType === 'analysis' ? 'Analysis' : 'Cover Letter'} Title
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Current title: <span className="font-normal text-gray-600">"{currentTitle}"</span>
            </Label>
            <UnifiedInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-gray-300 focus:ring-1 focus:ring-zapier-orange focus:border-zapier-orange text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
                if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              autoFocus
              placeholder="Enter new title..."
              maxLength={200}
              secure={true}
            />
          </div>
        </div>
        <DialogFooter className="pt-4 space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="px-4 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-zapier-orange hover:bg-zapier-orange/90 text-white"
            disabled={!title.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTitleDialog;