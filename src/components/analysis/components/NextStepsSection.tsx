
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileEdit, Search, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NextStepsSectionProps {
  onStartNew: () => void;
}

const NextStepsSection: React.FC<NextStepsSectionProps> = ({ onStartNew }) => {
  const { toast } = useToast();

  const handleReviseCV = () => {
    toast({
      title: "Feature Coming Soon",
      description: "CV Revision feature will cost 1 Credit. This feature is currently in development.",
      duration: 5000,
    });
  };

  const handleOptimizeATS = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "ATS Optimization feature will cost 1 Credit. This feature is currently in development.",
      duration: 5000,
    });
  };

  const handleAnalyzeAnother = () => {
    onStartNew();
  };

  return (
    <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-blueberry dark:text-citrus flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Next Steps
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
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs text-blue-700">
                💳 Costs 1 Credit - Coming Soon
              </AlertDescription>
            </Alert>
          </div>

          {/* ATS Optimization Option */}
          <div className="space-y-3">
            <Button
              onClick={handleOptimizeATS}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Search className="h-6 w-6 text-green-600" />
              <span className="font-medium">Optimize your CV for ATS</span>
            </Button>
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-xs text-green-700">
                💳 Costs 1 Credit - Coming Soon
              </AlertDescription>
            </Alert>
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
  );
};

export default NextStepsSection;
