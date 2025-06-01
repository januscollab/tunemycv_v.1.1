
import React, { useState, useEffect } from 'react';
import { Edit3, Save, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DownloadOptions from './DownloadOptions';

interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({ content, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalContent] = useState(content);
  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  useEffect(() => {
    setHasUnsavedChanges(editedContent !== content);
  }, [editedContent, content]);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    toast({
      title: 'Changes Saved',
      description: 'Your cover letter has been updated successfully.',
    });
  };

  const handleRevert = () => {
    setEditedContent(originalContent);
    setHasUnsavedChanges(false);
    toast({
      title: 'Reverted to Original',
      description: 'Your changes have been reverted to the original generated content.',
    });
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const characterCount = editedContent.length;
  const fileName = `cover-letter-${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
            {isEditing ? 'Preview Mode' : 'Edit Mode'}
          </Button>
          
          {hasUnsavedChanges && (
            <Button variant="outline" size="sm" onClick={handleRevert}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Revert to Original
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isEditing && (
            <>
              <span className="text-sm text-gray-500">
                {characterCount} characters
              </span>
              {hasUnsavedChanges && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </>
              )}
            </>
          )}
          {!isEditing && (
            <DownloadOptions content={editedContent} fileName={fileName} />
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={20}
            className="w-full font-sans text-sm leading-relaxed resize-none"
            placeholder="Edit your cover letter content here..."
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {editedContent}
          </pre>
        )}
      </div>

      {hasUnsavedChanges && !isEditing && (
        <div className="text-sm text-orange-600 dark:text-orange-400">
          You have unsaved changes. Click "Edit Mode" to continue editing or "Save Changes" to save.
        </div>
      )}
    </div>
  );
};

export default EditableCoverLetter;
