
import React from 'react';
import { CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingActionBarProps {
  credits: number;
  actionText: string;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
  creditCost: number;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  credits,
  actionText,
  onAction,
  disabled = false,
  loading = false,
  creditCost
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-xl border border-apple-core/20 dark:border-citrus/20 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-apricot" />
            <span className="font-semibold text-blueberry dark:text-citrus">
              {credits} Credits
            </span>
          </div>
          <Badge variant="outline" className="text-apricot border-apricot bg-apricot/10">
            <Zap className="h-3 w-3 mr-1" />
            {creditCost} Credit{creditCost > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Button
          onClick={onAction}
          disabled={disabled || loading || credits < creditCost}
          className="w-full bg-apricot hover:bg-apricot/90 text-white font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            actionText
          )}
        </Button>
        
        {credits < creditCost && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Insufficient credits
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingActionBar;
