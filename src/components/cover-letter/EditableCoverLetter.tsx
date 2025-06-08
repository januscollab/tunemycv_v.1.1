
import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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

  // Auto-save functionality with debounce (no toast notifications)
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

  return (
    <div className="space-y-4">
      <div className="bg-muted/20 p-4 rounded-lg">
        <RichTextEditor
          value={editedContent}
          onChange={setEditedContent}
          className="w-full min-h-[400px] bg-transparent"
          placeholder="Edit your cover letter content here..."
        />
      </div>
    </div>
  );
};

export default EditableCoverLetter;
