
import React from 'react';
import { Eye, Trash2, Edit, FileText, MessageSquare } from 'lucide-react';
import DownloadMenu from '@/components/ui/download-menu';

interface DocumentActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCoverLetter?: () => void;
  onInterviewPrep?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadWord?: () => void;
  showEdit?: boolean;
  showCoverLetter?: boolean;
  showInterviewPrep?: boolean;
  showDownload?: boolean;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  onCoverLetter,
  onInterviewPrep,
  onDownloadTxt,
  onDownloadPdf,
  onDownloadWord,
  showEdit = false,
  showCoverLetter = false,
  showInterviewPrep = false,
  showDownload = false
}) => {
  return (
    <div className="flex items-center space-x-3">
      {showCoverLetter && onCoverLetter && (
        <button
          onClick={onCoverLetter}
          className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-zapier-orange hover:bg-zapier-orange/10 rounded-md transition-colors"
        >
          <FileText className="h-4 w-4 mr-1" />
          Cover Letter
        </button>
      )}
      
      {showInterviewPrep && onInterviewPrep && (
        <button
          onClick={onInterviewPrep}
          className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-zapier-orange hover:bg-zapier-orange/10 rounded-md transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Interview Prep
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center px-3 py-2 text-sm text-purple-600 hover:text-zapier-orange hover:bg-zapier-orange/10 rounded-md transition-colors"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </button>
      )}
      
      {showDownload && onDownloadTxt && onDownloadPdf && onDownloadWord && (
        <DownloadMenu
          onDownloadTxt={onDownloadTxt}
          onDownloadPdf={onDownloadPdf}
          onDownloadWord={onDownloadWord}
        />
      )}
      
      {onView && (
        <button
          onClick={onView}
          className="flex items-center text-sm text-gray-600 hover:text-zapier-orange transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
      )}
      
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:text-zapier-orange transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DocumentActions;
