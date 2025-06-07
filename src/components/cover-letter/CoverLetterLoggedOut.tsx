
import React from 'react';
import { Edit } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';

const CoverLetterLoggedOut = () => {
  const coverLetterExplanation = {
    title: '',
    subtitle: '',
    benefits: [
      'AI-powered cover letter generation tailored to specific job descriptions',
      'Professional formatting and structure optimized for different industries',
      'Customizable templates that highlight your unique qualifications and experience'
    ],
    features: [
      'Upload your CV to automatically extract relevant experience and skills',
      'Paste the job description to ensure perfect alignment with requirements',
      'Generate multiple versions and download in professional formats'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-start text-left">
            <Edit className="h-12 w-12 text-zapier-orange mr-6 mt-0" />
            <div className="text-left">
              <h1 className="text-display font-bold text-foreground mb-4 text-left">
                Generate Cover Letter
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal text-left">
                Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-6 w-4/5 mx-auto">
          <div className="flex items-start">
            <ServiceExplanation
              title={coverLetterExplanation.title}
              subtitle={coverLetterExplanation.subtitle}
              benefits={coverLetterExplanation.benefits}
              features={coverLetterExplanation.features}
              icon={<Edit className="h-8 w-8 text-zapier-orange" />}
              compact={true}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <EmbeddedAuth
                  title="Login to Get Started"
                  description="Cover letter generation requires an account to ensure personalized results and save your documents."
                  icon={<Edit className="h-6 w-6 text-zapier-orange mr-2" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterLoggedOut;
