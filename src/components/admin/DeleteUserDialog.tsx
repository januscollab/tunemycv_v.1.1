import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserStats {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  credits: number;
  total_analyses: number;
  last_analysis: string;
}

interface DeleteUserDialogProps {
  user: UserStats | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  onClose,
  onConfirm,
  loading
}) => {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-medium mb-2">
              This action cannot be undone!
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm">
              This will permanently delete the user account and all associated data including:
            </p>
            <ul className="text-red-700 dark:text-red-300 text-sm mt-2 ml-4 list-disc">
              <li>Profile information</li>
              <li>CV uploads and analysis results</li>
              <li>Cover letters</li>
              <li>Credit history</li>
              <li>All user settings</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">User Details:</h4>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Name:</span> {user.first_name || 'N/A'} {user.last_name || ''}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Credits:</span> {user.credits}</p>
              <p><span className="font-medium">Total Analyses:</span> {user.total_analyses}</p>
              <p><span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type the user's email address to confirm deletion:
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete User
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;