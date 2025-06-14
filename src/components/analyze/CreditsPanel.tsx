
import React from 'react';
import { CreditCard, Zap, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreditsPanelProps {
  credits: number;
  hasCreditsForAI: boolean;
}

const CreditsPanel: React.FC<CreditsPanelProps> = ({ credits, hasCreditsForAI }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border border-border sticky top-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CreditCard className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-subheading font-semibold text-foreground">
            Your Credits
          </h3>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-title font-bold text-primary">
              {credits}
            </span>
            <span className="text-caption text-muted-foreground">
              Credits
            </span>
          </div>
        </div>

        <div className="space-y-2 text-micro text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>CV Analysis</span>
            <span className="text-primary font-medium">2 Credits</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cover Letter</span>
            <span className="text-primary font-medium">1 Credit</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Interview Prep</span>
            <span className="text-primary font-medium">2 Credits</span>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-lg ${credits < 10 ? 'bg-warning-50 border border-warning' : 'bg-primary/10'}`}>
          {credits < 10 ? (
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-micro text-warning font-medium mb-1">
                  You're running low on credits!
                </p>
                <Link 
                  to="/pricing" 
                  className="text-micro text-warning hover:text-warning/80 underline flex items-center space-x-1"
                >
                  <span>Top up your credits</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-micro text-foreground">
              {hasCreditsForAI 
                ? "You have credits available for AI analysis with multiple free AI iterations"
                : "Purchase credits to unlock AI-powered features"
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditsPanel;
