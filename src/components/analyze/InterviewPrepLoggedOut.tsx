
import React from 'react';
import { MessageSquare } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { Link } from 'react-router-dom';

const InterviewPrepLoggedOut = () => {
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
              <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
                Interview Prep Generator
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                Generate personalized interview preparation notes with company insights, strategic questions, and professional tips to ace your next interview.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12">
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

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-8 border border-apple-core/20 dark:border-citrus/20">
            <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">
              Ready to Ace Your Next Interview?
            </h3>
            <p className="text-lg text-earth/70 dark:text-white/70 mb-6">
              Join thousands of job seekers who have successfully landed their dream jobs with our AI-powered interview preparation.
            </p>
            <Link 
              to="/auth"
              className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center"
            >
              <MessageSquare className="mr-2 h-5 w-5 text-white" />
              Start Interview Prep Generator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepLoggedOut;
