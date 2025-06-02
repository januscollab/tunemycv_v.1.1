
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Users, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-zapier-orange/10 text-zapier-orange px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Career Optimization
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-earth dark:text-white mb-6 leading-tight">
            Turn Your CV Into a
            <span className="text-zapier-orange"> Job-Winning</span> Asset
          </h1>
          
          <p className="text-xl text-earth/70 dark:text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get AI-powered analysis, personalized recommendations, and professional cover letters 
            that help you stand out from the competition and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={user ? "/analyze" : "/auth"}
              className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors flex items-center justify-center"
            >
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/resources"
              className="border border-earth/20 dark:border-white/20 text-earth dark:text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-earth/5 dark:hover:bg-white/5 transition-colors"
            >
              Explore Resources
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

      {/* Features Grid */}
      <section className="py-20 px-4 bg-cream/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-earth dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-earth/70 dark:text-white/70 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you optimize every aspect of your job application
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-earth/10 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-earth/10 dark:border-white/10">
              <div className="bg-zapier-orange/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">CV Analysis</h3>
              <p className="text-earth/70 dark:text-white/70 leading-relaxed mb-6">
                Get detailed insights into your CV's performance, keyword optimization, and compatibility with specific job requirements.
              </p>
              <Link
                to={user ? "/analyze" : "/auth"}
                className="text-zapier-orange font-semibold hover:text-zapier-orange/80 transition-colors inline-flex items-center"
              >
                Start Analysis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-earth/10 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-earth/10 dark:border-white/10">
              <div className="bg-zapier-orange/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">Cover Letters</h3>
              <p className="text-earth/70 dark:text-white/70 leading-relaxed mb-6">
                Generate personalized, compelling cover letters that highlight your strengths and align with job requirements.
              </p>
              <Link
                to={user ? "/cover-letter" : "/auth"}
                className="text-zapier-orange font-semibold hover:text-zapier-orange/80 transition-colors inline-flex items-center"
              >
                Generate Letter <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-earth/10 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-earth/10 dark:border-white/10">
              <div className="bg-zapier-orange/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">Interview Prep</h3>
              <p className="text-earth/70 dark:text-white/70 leading-relaxed mb-6">
                Prepare for interviews with personalized questions and practice sessions based on your CV and target role.
              </p>
              <span className="text-zapier-orange font-semibold inline-flex items-center">
                Coming Soon <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </div>

            <div className="bg-white dark:bg-earth/10 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-earth/10 dark:border-white/10">
              <div className="bg-zapier-orange/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-2xl font-bold text-earth dark:text-white mb-4">Career Resources</h3>
              <p className="text-earth/70 dark:text-white/70 leading-relaxed mb-6">
                Access expert guides, templates, and tools to accelerate your job search and career advancement.
              </p>
              <Link
                to="/resources"
                className="text-zapier-orange font-semibold hover:text-zapier-orange/80 transition-colors inline-flex items-center"
              >
                Explore Resources <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-zapier-orange to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already improved their job prospects with TuneMyCV
          </p>
          <Link
            to={user ? "/analyze" : "/auth"}
            className="bg-white text-zapier-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer - ONLY ONE FOOTER SHOULD REMAIN */}
      <Footer />
    </div>
  );
};

export default Index;
