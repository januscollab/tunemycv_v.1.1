import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  FileText, 
  Edit, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight,
  Menu,
  X,
  Zap
} from 'lucide-react';
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
  showBackForward?: boolean;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  customActions,
  position = 'bottom-right',
  showBackForward = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const defaultActions: QuickAction[] = [
    {
      id: 'interview-toolkit',
      label: 'Interview Toolkit',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/interview-toolkit',
      variant: 'secondary',
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
      id: 'analyze',
      label: 'Analyze CV',
      icon: <FileText className="w-5 h-5" />,
      href: '/analyze',
      variant: 'default',
      requiresAuth: true
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      onClick: () => {
        // Create and dispatch a custom event to open feedback
        window.dispatchEvent(new CustomEvent('openFeedback'));
      },
      variant: 'outline',
      requiresAuth: false
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
    setIsHovered(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  // Don't show quick actions on auth page or home page for non-authenticated users
  if (location.pathname === '/auth' || (location.pathname === '/' && !user)) {
    return null;
  }

  return (
    <div 
      className={cn("fixed z-[9999]", positionClasses[position], className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TooltipProvider>
        <div className="flex flex-col items-end space-y-3">

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <>
              {/* Action Items */}
              <div className={cn(
                "flex flex-col items-end space-y-3 transition-all duration-300 transform origin-bottom-right",
                isHovered ? "scale-100 opacity-100 translate-x-0" : "scale-95 opacity-0 translate-x-2"
              )}>
                {filteredActions.map((action, index) => (
                  <TooltipProvider key={action.id}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          onClick={() => handleAction(action)}
                          className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-all duration-200 bg-white border-2 border-zapier-orange text-zapier-orange hover:bg-zapier-orange hover:text-white"
                          style={{ 
                            zIndex: 10000 + index,
                            position: 'relative'
                          }}
                        >
                          {action.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        sideOffset={8}
                        className="bg-popover text-popover-foreground border border-popover-border shadow-md"
                      >
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Main Toggle Button */}
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className={cn(
                        "w-14 h-14 rounded-full shadow-lg transition-all duration-300 relative",
                        isHovered 
                          ? "bg-zapier-orange hover:bg-zapier-orange/90 scale-110" 
                          : "bg-zapier-orange hover:bg-zapier-orange/90 hover:scale-110"
                      )}
                      style={{ zIndex: 10000 }}
                    >
                      <Zap className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="left" 
                    sideOffset={8}
                    className="bg-popover text-popover-foreground border border-popover-border shadow-md"
                  >
                    <p>Quick Actions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default QuickActions;