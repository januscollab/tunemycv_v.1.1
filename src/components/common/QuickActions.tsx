import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  FileText, 
  Edit, 
  MessageSquare, 
  Menu,
  X,
  Zap
} from 'lucide-react';
import { FloatingFeedbackForm } from './FloatingFeedbackForm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  requiresAuth?: boolean;
}

interface QuickActionsProps {
  customActions?: QuickAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  customActions,
  position = 'bottom-right',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const defaultActions: QuickAction[] = [
    {
      id: 'analyze',
      label: 'Analyze CV',
      icon: <FileText className="w-5 h-5" />,
      href: '/analyze',
      variant: 'default',
      requiresAuth: true
    },
    {
      id: 'cover-letter',
      label: 'Cover Letter',
      icon: <Edit className="w-5 h-5" />,
      href: '/cover-letter',
      variant: 'secondary',
      requiresAuth: true
    },
    {
      id: 'interview-prep',
      label: 'Interview Prep',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/analyze?tab=interview-prep',
      variant: 'secondary',
      requiresAuth: true
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      variant: 'outline',
      onClick: () => setShowFeedback(true)
    }
  ];

  const actions = customActions || defaultActions;
  const filteredActions = actions.filter(action => 
    !action.requiresAuth || (action.requiresAuth && user)
  );

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6'
  };

  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
    setIsOpen(false);
  };

  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'homepage';
    if (pathname.includes('/analyze')) return 'analyze';
    if (pathname.includes('/resources')) return 'resources';
    if (pathname.includes('/profile')) return 'profile';
    return 'default';
  };

  // Don't show quick actions on auth page or home page for non-authenticated users
  if (location.pathname === '/auth' || (location.pathname === '/' && !user)) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn("fixed z-40", positionClasses[position], className)}>
        <div className="flex flex-col items-end space-y-3">

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <>
              {/* Action Items */}
              <div className={cn(
                "flex flex-col items-end space-y-3 transition-all duration-300 transform origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}>
                {filteredActions.map((action) => (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                      variant={action.variant || 'secondary'}
                        size="icon"
                        onClick={() => handleAction(action)}
                        className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                      >
                        {action.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Main Toggle Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                      "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                      isOpen 
                        ? "bg-destructive hover:bg-destructive/90 rotate-180" 
                        : "bg-primary hover:bg-primary/90 hover:scale-110"
                    )}
                  >
                    {isOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isOpen ? 'Close Quick Actions' : 'Quick Actions'}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
            onClick={() => setShowFeedback(false)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-scale-in">
              <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 border-b border-zapier-orange/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-earth dark:text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-zapier-orange" />
                      Share Your Feedback
                    </h2>
                    <p className="text-sm text-earth/70 dark:text-white/70 mt-1">
                      Help us improve TuneMyCV
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="text-earth/60 hover:text-earth dark:text-white/60 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close feedback form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <FloatingFeedbackForm 
                  onClose={() => setShowFeedback(false)} 
                  currentPage={getCurrentPage()}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </TooltipProvider>
  );
};

export default QuickActions;