
import React from 'react';
import { MessageSquare, HelpCircle, Lightbulb, Star } from 'lucide-react';

interface InterviewPrepSectionProps {
  interviewPrep?: {
    likelyQuestions: string[];
    suggestedAnswers: Array<{
      question: string;
      approach: string;
      keyPoints: string[];
    }>;
    situationalQuestions: Array<{
      scenario: string;
      framework: string;
      exampleResponse: string;
    }>;
  };
}

const InterviewPrepSection: React.FC<InterviewPrepSectionProps> = ({ interviewPrep }) => {
  if (!interviewPrep) return null;

  const { likelyQuestions = [], suggestedAnswers = [], situationalQuestions = [] } = interviewPrep;

  return (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-heading font-semibold text-foreground">Interview Preparation</h2>
      </div>

      <div className="space-y-6">
        {/* Likely Questions */}
        {likelyQuestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-info mb-4 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Likely Questions ({likelyQuestions.length})
            </h3>
            <div className="space-y-2">
              {likelyQuestions.map((question, index) => (
                <div key={index} className="border border-info rounded-lg p-3 bg-info-50">
                  <p className="text-caption text-foreground">{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Answers */}
        {suggestedAnswers.length > 0 && (
          <div>
            <h3 className="font-semibold text-success mb-4 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Answer Frameworks ({suggestedAnswers.length})
            </h3>
            <div className="space-y-4">
              {suggestedAnswers.map((answer, index) => (
                <div key={index} className="border border-success rounded-lg p-4 bg-success-50">
                  <h4 className="font-medium text-foreground mb-2">{answer.question}</h4>
                  <p className="text-caption text-muted-foreground mb-3">{answer.approach}</p>
                  <div>
                    <h5 className="text-micro font-medium text-success mb-2">Key Points to Cover:</h5>
                    <ul className="text-micro text-success space-y-1">
                      {answer.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Situational Questions */}
        {situationalQuestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-warning mb-4 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Situational Questions ({situationalQuestions.length})
            </h3>
            <div className="space-y-4">
              {situationalQuestions.map((situation, index) => (
                <div key={index} className="border border-warning rounded-lg p-4 bg-warning-50">
                  <h4 className="font-medium text-foreground mb-2">{situation.scenario}</h4>
                  
                  <div className="mb-3">
                    <h5 className="text-micro font-medium text-warning mb-1">Framework:</h5>
                    <p className="text-micro text-warning">{situation.framework}</p>
                  </div>
                  
                  <div className="bg-background/70 rounded p-3">
                    <h5 className="text-micro font-medium text-muted-foreground mb-1">Example Response:</h5>
                    <p className="text-micro text-muted-foreground italic">"{situation.exampleResponse}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {likelyQuestions.length === 0 && suggestedAnswers.length === 0 && situationalQuestions.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interview preparation content will be available after a comprehensive analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrepSection;
