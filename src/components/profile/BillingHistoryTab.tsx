
import React from 'react';
import { CreditCard, Clock } from 'lucide-react';

interface BillingHistoryTabProps {
  credits: number;
  memberSince: string;
}

const BillingHistoryTab: React.FC<BillingHistoryTabProps> = ({ credits, memberSince }) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <div className="flex items-center mb-6">
          <CreditCard className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-heading font-semibold text-foreground">Billing History</h2>
        </div>

        <div className="text-center py-12">
          <div className="bg-primary/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-heading font-medium text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We're building a comprehensive billing history that will show all your credit purchases and usage transactions.
          </p>
          
          <div className="bg-muted rounded-lg p-4 max-w-lg mx-auto">
            <h4 className="font-medium text-foreground mb-2">What you'll see here:</h4>
            <ul className="text-caption text-muted-foreground space-y-1 text-left">
              <li>• Complete credit purchase history</li>
              <li>• Detailed credit usage per analysis</li>
              <li>• Transaction dates and amounts</li>
              <li>• Current credit balance tracking</li>
              <li>• Downloadable billing statements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHistoryTab;
