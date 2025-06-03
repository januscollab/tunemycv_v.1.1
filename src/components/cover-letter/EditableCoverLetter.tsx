
import React, { useState, useEffect } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DownloadOptions from './DownloadOptions';

interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onDownload?: () => void;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({ 
  content, 
  onSave, 
  initialContent,
  onContentChange,
  onDownload 
}) => {
  const [editedContent, setEditedContent] = useState(content || initialContent || '');
  const [originalContent] = useState(content || initialContent || '');
  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content || initialContent || '');
  }, [content, initialContent]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (editedContent !== (content || initialContent) && editedContent.trim() !== '') {
      const timeoutId = setTimeout(() => {
        if (onSave) {
          onSave(editedContent);
        } else if (onContentChange) {
          onContentChange(editedContent);
        }
      }, 2000); // Auto-save after 2 seconds of no typing

      return () => clearTimeout(timeoutId);
    }
  }, [editedContent, content, initialContent, onSave, onContentChange]);

  const handleRevert = () => {
    setEditedContent(originalContent);
    toast({
      title: 'Reverted to Original',
      description: 'Your changes have been reverted to the original generated content.',
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Your Cover Letter</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRevert}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Revert
          </Button>
          <DownloadOptions
            content={editedContent}
            fileName="cover-letter"
            triggerComponent={
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={20}
          className="w-full font-sans text-sm leading-relaxed resize-none"
          placeholder="Edit your cover letter content here..."
        />
      </div>
    </div>
  );
};

export default EditableCoverLetter;
