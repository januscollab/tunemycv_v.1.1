import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  orientation = 'horizontal',
  className
}) => {
  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: string) => stepId === currentStep;
  const isStepUpcoming = (stepId: string) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = steps.findIndex(step => step.id === stepId);
    return stepIndex > currentIndex;
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => {
          const completed = isStepCompleted(step.id);
          const current = isStepCurrent(step.id);
          const upcoming = isStepUpcoming(step.id);

          return (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                    completed && "bg-primary border-primary text-primary-foreground",
                    current && "bg-primary/10 border-primary text-primary animate-pulse",
                    upcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {completed ? (
                    <Check className="w-4 h-4" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-8 mt-2 transition-colors duration-300",
                      completed ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-8">
                <h4
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    completed && "text-foreground",
                    current && "text-primary",
                    upcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p
                    className={cn(
                      "text-xs mt-1 transition-colors duration-300",
                      completed && "text-muted-foreground",
                      current && "text-muted-foreground",
                      upcoming && "text-muted-foreground/70"
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const completed = isStepCompleted(step.id);
        const current = isStepCurrent(step.id);
        const upcoming = isStepUpcoming(step.id);

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center space-y-2 min-w-0 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  completed && "bg-primary border-primary text-primary-foreground scale-110",
                  current && "bg-primary/10 border-primary text-primary animate-pulse scale-110",
                  upcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {completed ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    {step.icon}
                  </div>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="text-center">
                <h4
                  className={cn(
                    "text-sm font-medium transition-colors duration-300 px-2",
                    completed && "text-foreground",
                    current && "text-primary font-semibold",
                    upcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p
                    className={cn(
                      "text-xs mt-1 transition-colors duration-300 px-2",
                      completed && "text-muted-foreground",
                      current && "text-muted-foreground",
                      upcoming && "text-muted-foreground/70"
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-300 max-w-20",
                  completed ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
