
import React, { useState, useEffect, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto to get accurate scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const scrollHeight = textareaRef.current.scrollHeight;
          const minHeight = 400; // Minimum height for cover letters
          // Remove max height constraint to allow unlimited expansion
          const newHeight = Math.max(minHeight, scrollHeight + 20); // Add small padding
          textareaRef.current.style.height = `${newHeight}px`;
        }
      });
    }
  };

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-resize textarea when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [editedContent]);

  // Auto-resize on component mount and window resize
  useEffect(() => {
    adjustTextareaHeight();
    const handleResize = () => adjustTextareaHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    // Immediately trigger resize for responsive height adjustment
    adjustTextareaHeight();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <Textarea
          ref={textareaRef}
          value={editedContent}
          onChange={handleContentChange}
          className="w-full font-sans text-caption leading-relaxed resize-none border-0 focus:ring-0 bg-transparent"
          style={{ minHeight: '400px' }}
          placeholder="Edit your cover letter content here..."
        />
      </div>
    </div>
  );
};

export default EditableCoverLetter;
