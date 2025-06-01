
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NextStepsSectionProps {
  onStartNew: () => void;
}

const NextStepsSection: React.FC<NextStepsSectionProps> = ({ onStartNew }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-8 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-2xl font-semibold text-blueberry dark:text-citrus mb-6">
        What's Next?
      </h3>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <Button 
            onClick={onStartNew}
            variant="outline" 
            size="lg" 
            className="w-full mb-3 h-12"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Analyze Another CV
          </Button>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
            Compare different positions or update your analysis with a revised CV.
          </p>
        </div>

        <div className="text-center">
          <Link to="/cover-letter">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full mb-3 h-12 bg-apricot hover:bg-apricot/90"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Cover Letter
            </Button>
          </Link>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
            Create a personalized cover letter based on this analysis.
          </p>
        </div>

        <div className="text-center">
          <Link to="/next-steps">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full mb-3 h-12"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Career Guidance
            </Button>
          </Link>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
            Get personalized career advice and interview preparation tips.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NextStepsSection;
