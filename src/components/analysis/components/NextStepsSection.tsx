
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
            <div className="space-y-3">
              <Button
                onClick={handleReviseCV}
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <FileEdit className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Let us Revise Your CV</span>
              </Button>
            </div>

            {/* ATS Optimization Option */}
            <div className="space-y-3">
              <Button
                onClick={handleOptimizeATS}
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Search className="h-6 w-6 text-green-600" />
                <span className="font-medium">Optimize your CV for Applicant Tracking System (ATS)</span>
              </Button>
            </div>

            {/* Analyze Another Role Option */}
            <div className="space-y-3">
              <Button
                onClick={handleAnalyzeAnother}
                variant="default"
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-apricot hover:bg-apricot/90"
              >
                <RotateCcw className="h-6 w-6" />
                <span className="font-medium">Analyse another Role</span>
              </Button>
              <Alert className="bg-apricot/10 border-apricot/30">
                <AlertDescription className="text-xs text-apricot">
                  ✨ Start a new analysis
                </AlertDescription>
              </Alert>
            </div>
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
