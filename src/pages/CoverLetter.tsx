
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, ArrowRight, Sparkles } from 'lucide-react';

const CoverLetter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Create Cover Letter</h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl">
            Generate a tailored cover letter that aligns your experience with the role — crafted from your CV and the job description for maximum impact.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sample Cover Letter Generation */}
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow-sm border border-apple-core/20 dark:border-citrus/20 p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-apricot mr-3" />
              <h2 className="text-2xl font-bold text-blueberry dark:text-citrus">Generate Sample Cover Letter</h2>
            </div>
            
            <p className="text-blueberry/80 dark:text-apple-core/80 mb-6">
              Get a quick sample cover letter to see how our AI can help you create compelling applications.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Marketing Manager"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., TechCorp"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <button className="w-full bg-apricot text-white py-3 px-4 rounded-md font-medium hover:bg-apricot/90 transition-colors flex items-center justify-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Sample Cover Letter
            </button>
            
            <p className="text-sm text-blueberry/60 dark:text-apple-core/60 mt-3 text-center">
              Coming soon - sample generation functionality
            </p>
          </div>

          {/* Account Benefits */}
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow-sm border border-apple-core/20 dark:border-citrus/20 p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-blueberry dark:text-citrus">Have an Account?</h2>
            </div>
            
            <p className="text-blueberry/80 dark:text-apple-core/80 mb-6">
              Sign in to unlock the full power of our AI-powered career tools.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-apricot rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-blueberry dark:text-citrus">Personalized Cover Letters</h3>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
                    Generate cover letters based on your analyzed CV and specific job requirements
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-apricot rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-blueberry dark:text-citrus">Interview Preparation</h3>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
                    Get bespoke analysis of companies, latest news, and interview focus areas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-apricot rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-blueberry dark:text-citrus">CV Analysis History</h3>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
                    Access all your previous CV analyses and track your progress
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/auth"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Sign In to Your Account
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            
            <p className="text-sm text-blueberry/60 dark:text-apple-core/60 mt-3 text-center">
              Don't have an account? <Link to="/auth" className="text-apricot hover:text-apricot/80 underline">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
