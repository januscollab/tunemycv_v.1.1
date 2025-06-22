
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';

interface NoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseManualInput: () => void;
}

const NoAnalysisModal: React.FC<NoAnalysisModalProps> = ({ isOpen, onClose, onUseManualInput }) => {
  const navigate = useNavigate();

  const handleAnalyzeNow = () => {
    navigate('/analyze');
    onClose();
  };

  const handleUseManualInput = () => {
    onUseManualInput();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Search className="h-5 w-5 text-apricot" />
            <DialogTitle>No CV Analysis Found</DialogTitle>
          </div>
          <DialogDescription>
            You haven't analyzed a CV against a role yet. To generate a cover letter from analysis, you'll need to analyze your CV first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={handleAnalyzeNow} className="bg-apricot hover:bg-apricot/90 w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Analyze CV Now
          </Button>
          <Button variant="outline" onClick={handleUseManualInput} className="w-full sm:w-auto">
            Use Manual Input
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoAnalysisModal;
