
import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
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

  return (
    <div className="space-y-4">
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
