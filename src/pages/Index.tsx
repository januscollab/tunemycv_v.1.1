
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Users, TrendingUp, Sparkles, MessageSquare, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import MainFeaturesSection from '@/components/common/MainFeaturesSection';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-10 px-4 bg-gradient-to-br from-white via-cream/30 to-apple-core/10 dark:from-gray-900 dark:via-blueberry/20 dark:to-citrus/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-zapier-orange/10 text-zapier-orange px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Career Optimization
          </div>
          
          <h1 className="text-display md:text-6xl font-display font-bold text-earth dark:text-white mb-6 leading-tight">
            Turn Your CV Into a
            <span className="text-zapier-orange"> Job-Winning</span> Asset
          </h1>
          
          <p className="text-subheading text-earth/70 dark:text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get AI-powered analysis, personalized recommendations, and professional cover letters 
            that help you stand out from the competition and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={user ? "/analyze" : "/analyze"}
              className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors flex items-center justify-center"
            >
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to={user ? "/cover-letter" : "/cover-letter"}
              className="border border-earth/20 dark:border-white/20 text-earth dark:text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-earth/5 dark:hover:bg-white/5 transition-colors"
            >
              Create Cover Letter
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-earth/60 dark:text-white/60">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>100% Free to Start</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <MainFeaturesSection />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section - Updated background color to match Resources page */}
      <section className="py-16 bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-title md:text-display font-display font-bold text-earth dark:text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-subheading text-earth/70 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully landed their dream jobs with TuneMyCV
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/analyze"
              className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center justify-center"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Free Analysis
            </Link>
            <Link 
              to="/resources"
              className="border-2 border-zapier-orange text-zapier-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange hover:text-white transition-colors inline-flex items-center justify-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
