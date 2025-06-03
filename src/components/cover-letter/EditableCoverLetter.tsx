
import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({ content, onSave }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [originalContent] = useState(content);
  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (editedContent !== content && editedContent.trim() !== '') {
      const timeoutId = setTimeout(() => {
        onSave(editedContent);
      }, 2000); // Auto-save after 2 seconds of no typing

      return () => clearTimeout(timeoutId);
    }
  }, [editedContent, content, onSave]);

  const handleRevert = () => {
    setEditedContent(originalContent);
    toast({
      title: 'Reverted to Original',
      description: 'Your changes have been reverted to the original generated content.',
    });
  };

  const characterCount = editedContent.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRevert}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Revert to Original
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {characterCount} characters
          </span>
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
