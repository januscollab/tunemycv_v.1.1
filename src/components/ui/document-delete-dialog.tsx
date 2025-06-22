
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DocumentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  documentType: 'CV Analysis' | 'Cover Letter' | 'Interview Prep';
  title?: string;
  customDescription?: string;
}

const DocumentDeleteDialog: React.FC<DocumentDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  documentType,
  title,
  customDescription
}) => {
  const getDefaultDescription = () => {
    switch (documentType) {
      case 'CV Analysis':
        return 'This will permanently delete the CV analysis and any associated cover letters or interview prep materials. This action cannot be undone.';
      case 'Cover Letter':
        return 'This will permanently delete the cover letter. This action cannot be undone.';
      case 'Interview Prep':
        return 'This will permanently delete the interview preparation materials. This action cannot be undone.';
      default:
        return 'This will permanently delete this document. This action cannot be undone.';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-heading font-semibold">
            {title || `Delete ${documentType}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            {customDescription || getDefaultDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
          <AlertDialogCancel className="mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete {documentType}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DocumentDeleteDialog;
