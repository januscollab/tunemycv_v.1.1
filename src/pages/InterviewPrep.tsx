
import React from 'react';
import { MessageSquare } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';


const InterviewPrep = () => {
  const interviewPrepExplanation = {
    title: '',
    subtitle: '',
    benefits: [
      'AI-powered interview preparation tailored to specific companies and roles',
      'Company research and recent news analysis for interview insights',
      'Personalized interview questions and strategic talking points',
      'Professional tips to stand out and make memorable impressions'
    ],
    features: [
      'Upload job description or use existing CV analysis results',
      'AI analyzes company profile, recent developments, and role requirements',
      'Generate comprehensive interview prep notes with company insights and strategic questions',
      'Download and review preparation materials before your interview'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-start">
            <MessageSquare className="h-12 w-12 text-zapier-orange mr-6 mt-0" />
            <div>
              <h1 className="text-display font-bold text-foreground mb-4">
                Interview Prep Toolkit
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                Generate personalized interview preparation notes with company insights, strategic questions, and professional tips to ace your next interview.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12 w-4/5 mx-auto">
          <div className="flex items-start">
            <ServiceExplanation
              title={interviewPrepExplanation.title}
              subtitle={interviewPrepExplanation.subtitle}
              benefits={interviewPrepExplanation.benefits}
              features={interviewPrepExplanation.features}
              icon={<MessageSquare className="h-8 w-8 text-zapier-orange" />}
              compact={true}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <EmbeddedAuth
                  title="Login to Get Started"
                  description="Interview prep generation requires an account to ensure personalized results and save your preparation materials."
                  icon={<MessageSquare className="h-6 w-6 text-zapier-orange mr-2" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
