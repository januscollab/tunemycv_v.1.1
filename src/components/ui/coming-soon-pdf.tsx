
import React from 'react';
import { FileText, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonPDFProps {
  onDownloadText?: () => void;
  className?: string;
}

export const ComingSoonPDF: React.FC<ComingSoonPDFProps> = ({ 
  onDownloadText, 
  className = "" 
}) => {
  return (
    <div className={`bg-surface border border-border rounded-lg p-8 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          PDF Report Viewer Coming Soon
        </h3>
        
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          We're working on an enhanced PDF viewer experience for your analysis reports. 
          In the meantime, you can download your report as a text file.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3" />
          <span>Feature under development</span>
        </div>
        
        {onDownloadText && (
          <Button 
            onClick={onDownloadText}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report as Text
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComingSoonPDF;
