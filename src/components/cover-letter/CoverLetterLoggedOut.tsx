
import React from 'react';
import { Edit } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { Link } from 'react-router-dom';

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
          <div className="flex items-start">
            <Edit className="h-12 w-12 text-zapier-orange mr-6 mt-0" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
                Generate Cover Letter
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                Generate tailored cover letters that highlight your strengths and align with specific job requirements.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12">
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

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-8 border border-apple-core/20 dark:border-citrus/20">
            <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">
              Ready to Create Your Perfect Cover Letter?
            </h3>
            <p className="text-lg text-earth/70 dark:text-white/70 mb-6">
              Join thousands of job seekers who have successfully landed interviews with our AI-powered cover letters.
            </p>
            <Link 
              to="/auth"
              className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center"
            >
              <Edit className="mr-2 h-5 w-5 text-white" />
              Start AI Cover Letter Generator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterLoggedOut;
