
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CVEditModalProps {
  cv: {
    id: string;
    file_name: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

const CVEditModal: React.FC<CVEditModalProps> = ({ cv, onClose, onUpdate }) => {
  const [newName, setNewName] = useState(cv.file_name);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newName.trim()) {
      toast({ title: 'Error', description: 'CV name cannot be empty', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('uploads')
        .update({ file_name: newName.trim() })
        .eq('id', cv.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'CV name updated successfully' });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating CV name:', error);
      toast({ title: 'Error', description: 'Failed to update CV name', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-blueberry rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-heading font-semibold text-blueberry dark:text-citrus">Edit CV Name</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-caption font-medium text-blueberry dark:text-apple-core mb-2">
              CV Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
              placeholder="Enter CV name..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-apple-core/30 dark:border-citrus/30 text-blueberry dark:text-apple-core rounded-md hover:bg-apple-core/10 dark:hover:bg-citrus/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-apricot text-white rounded-md hover:bg-apricot/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVEditModal;
