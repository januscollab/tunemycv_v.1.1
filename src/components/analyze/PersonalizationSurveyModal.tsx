import React, { useState } from 'react';
import { X, MessageSquare, Target, Heart, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { useToast } from '@/hooks/use-toast';

interface PersonalizationSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (responses: SurveyResponses) => void;
}

interface SurveyResponses {
  motivation: string;
  expectations: string;
  concerns: string;
  uniqueValue: string;
}

const PersonalizationSurveyModal: React.FC<PersonalizationSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Reset to question 1 when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
    }
  }, [isOpen]);
  const [responses, setResponses] = useState<SurveyResponses>({
    motivation: '',
    expectations: '',
    concerns: '',
    uniqueValue: ''
  });

  const questions = [
    {
      id: 'motivation',
      title: 'What motivates you about this specific role?',
      subtitle: 'Help us understand what draws you to this opportunity',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      placeholder: 'e.g., I\'m excited about the opportunity to lead a team and work on innovative projects that impact millions of users...',
      isPersonal: false
    },
    {
      id: 'expectations',
      title: 'What are you hoping to achieve in this role?',
      subtitle: 'Share your career goals and aspirations',
      icon: <Target className="h-5 w-5 text-blue-500" />,
      placeholder: 'e.g., I want to develop my leadership skills, contribute to strategic decisions, and grow in my technical expertise...',
      isPersonal: false
    },
    {
      id: 'concerns',
      title: 'Are there any personal circumstances driving this application?',
      subtitle: 'Feel free to skip if you prefer',
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      placeholder: 'e.g., I\'m looking for better work-life balance to spend more time with family, or seeking a role that offers remote work options...',
      isPersonal: true
    },
    {
      id: 'uniqueValue',
      title: 'Why should you not get this role?',
      subtitle: 'Feel free to skip if you prefer',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      placeholder: 'e.g., I might struggle with the steep learning curve, or I lack experience in certain technical areas mentioned in the job description...',
      isPersonal: true
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(responses);
    toast({
      title: 'Survey Completed',
      description: 'Thank you! Your responses will enhance your CV analysis.',
    });
    onClose();
  };

  const handleSkip = () => {
    onClose();
    toast({
      title: 'Survey Skipped',
      description: 'You can always retake this survey later for more personalized insights.',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-blueberry/90 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-apple-core/10 dark:border-citrus/20">
        {/* Header */}
        <div className="p-6 border-b border-apple-core/10 dark:border-citrus/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-zapier-orange/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-zapier-orange" />
            </div>
            <div>
              <h2 className="text-heading font-bold text-blueberry dark:text-citrus">
                Motivation Matters
              </h2>
              <p className="text-caption text-blueberry/60 dark:text-apple-core/60">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-apple-core/10 dark:hover:bg-citrus/10 rounded-lg transition-colors"
            aria-label="Close survey"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-zapier-orange h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
              <div className="flex items-start space-x-3">
                {currentQ.icon}
                <div className="flex-1">
                  <CardTitle className="text-subheading font-semibold text-blueberry dark:text-citrus mb-2">
                    {currentQ.title}
                  </CardTitle>
                  <p className="text-caption text-blueberry/70 dark:text-apple-core/70">
                    {currentQ.subtitle}
                  </p>
                  {currentQ.isPersonal && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-micro text-yellow-800 dark:text-yellow-200 font-medium flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        This question is deeply personal and completely optional. Feel free to skip if you prefer.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <FloatingLabelTextarea
                id={`survey-${currentQ.id}`}
                label={currentQ.title}
                value={responses[currentQ.id as keyof SurveyResponses]}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[120px]"
                autoFocus
              />
              <p className="text-micro text-blueberry/50 dark:text-apple-core/50 mt-2">
                Share as much or as little as you'd like. Every detail helps us provide better insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-apple-core/10 dark:border-citrus/20 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-blueberry/60 dark:text-apple-core/60 hover:text-blueberry dark:hover:text-apple-core"
            >
              Skip Survey
            </Button>
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-apple-core/30 dark:border-citrus/30"
              >
                Previous
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleNext}
            className="bg-zapier-orange hover:bg-zapier-orange/90 text-white"
          >
            {currentQuestion === questions.length - 1 ? 'Complete Survey' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSurveyModal;