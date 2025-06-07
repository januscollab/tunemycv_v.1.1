import React, { useState } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UnifiedTextarea } from '@/components/ui/unified-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentContent: string;
  transactionId: string;
}

const ErrorReportModal: React.FC<ErrorReportModalProps> = ({
  isOpen,
  onClose,
  documentName,
  documentContent,
  transactionId
}) => {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe the issue you encountered',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Call edge function to send error report email
      const { error } = await supabase.functions.invoke('send-error-report', {
        body: {
          transactionId,
          documentName,
          documentContent,
          userDescription: description.trim(),
          reportedAt: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: 'Report Sent',
        description: 'Thank you for reporting this issue. Our team will investigate it.'
      });

      onClose();
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit error report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Report an Error</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Help us improve by reporting issues with document processing
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm space-y-1">
              <p><strong>Document:</strong> {documentName}</p>
              <p><strong>Transaction ID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{transactionId}</code></p>
            </div>
          </div>
          
          <div>
            <UnifiedTextarea
              variant="floating"
              label="Describe the issue you encountered *"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what went wrong with the document processing..."
              rows={4}
              className="mt-1"
            />
          </div>
          
          <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p>This report will include the document content and your description to help our team investigate the issue.</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Sending...' : 'Send Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorReportModal;