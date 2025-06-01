
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, Search, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

interface NextStepsSectionProps {
  onStartNew: () => void;
}

const NextStepsSection: React.FC<NextStepsSectionProps> = ({ onStartNew }) => {
  const { toast } = useToast();
  const [showReviseDialog, setShowReviseDialog] = useState(false);
  const [showATSDialog, setShowATSDialog] = useState(false);

  const handleReviseCV = () => {
    setShowReviseDialog(true);
  };

  const handleOptimizeATS = () => {
    setShowATSDialog(true);
  };

  const handleConfirmRevise = () => {
    setShowReviseDialog(false);
    toast({
      title: "Feature Coming Soon",
      description: "CV Revision feature is currently in development.",
      duration: 5000,
    });
  };

  const handleConfirmATS = () => {
    setShowATSDialog(false);
    toast({
      title: "Feature Coming Soon", 
      description: "Applicant Tracking System (ATS) Optimization feature is currently in development.",
      duration: 5000,
    });
  };

  const handleAnalyzeAnother = () => {
    onStartNew();
  };

  return (
    <>
      <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blueberry dark:text-citrus flex items-center">
            <Info className="h-5 w-5 mr-2" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Revise CV Option */}
            <Button
              onClick={handleReviseCV}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-citrus hover:bg-citrus/90 text-blueberry"
            >
              <FileEdit className="h-6 w-6" />
              <span className="font-medium">Let us Revise Your CV</span>
            </Button>

            {/* ATS Optimization Option */}
            <Button
              onClick={handleOptimizeATS}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-apple-core hover:bg-apple-core/90 text-blueberry"
            >
              <Search className="h-6 w-6" />
              <span className="font-medium text-center">Optimize for Applicant Tracking System (ATS)</span>
            </Button>

            {/* Analyze Another Role Option */}
            <Button
              onClick={handleAnalyzeAnother}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-apricot hover:bg-apricot/90 text-white"
            >
              <RotateCcw className="h-6 w-6" />
              <span className="font-medium">Analyse Another Role</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revise CV Confirmation Dialog */}
      <ConfirmationDialog
        open={showReviseDialog}
        onOpenChange={setShowReviseDialog}
        title="CV Revision Service"
        description="Our AI will revise your CV to better match the job requirements, improving formatting, content, and keyword optimization."
        creditCost={1}
        onConfirm={handleConfirmRevise}
        onCancel={() => setShowReviseDialog(false)}
      />

      {/* ATS Optimization Confirmation Dialog */}
      <ConfirmationDialog
        open={showATSDialog}
        onOpenChange={setShowATSDialog}
        title="Applicant Tracking System (ATS) Optimization"
        description="We'll optimize your CV to pass through Applicant Tracking Systems used by most companies during initial screening."
        creditCost={1}
        onConfirm={handleConfirmATS}
        onCancel={() => setShowATSDialog(false)}
      />
    </>
  );
};

export default NextStepsSection;
