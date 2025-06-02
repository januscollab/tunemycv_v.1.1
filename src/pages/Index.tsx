
import { ArrowRight, CheckCircle, TrendingUp, Users, Star, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';

const Index = () => {
  const { user } = useAuth();

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-apple-core/20 via-white to-citrus/15 dark:from-blueberry/20 dark:via-gray-900 dark:to-citrus/10 py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blueberry dark:text-citrus mb-6 leading-tight">
            Optimize Your CV,
            <span className="text-apricot"> Accelerate Your Career</span>
          </h1>
          <p className="text-lg text-blueberry/70 dark:text-apple-core mb-8 max-w-2xl mx-auto leading-relaxed">
            TuneMyCV is an AI-powered platform that helps job seekers improve their CVs, 
            pass ATS systems, and increase their chances of landing their dream job.
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/analyze"
                className="bg-apricot text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-md"
              >
                <Upload className="mr-2 h-5 w-5" />
                Analyze Your CV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/cover-letter"
                className="border border-blueberry dark:border-citrus text-blueberry dark:text-citrus px-6 py-3 rounded-lg text-base font-semibold hover:border-apricot hover:text-apricot transition-colors"
              >
                Generate Cover Letter
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/analyze"
                className="bg-apricot text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-md"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={scrollToHowItWorks}
                className="border border-blueberry dark:border-citrus text-blueberry dark:text-citrus px-6 py-3 rounded-lg text-base font-semibold hover:border-apricot hover:text-apricot transition-colors"
              >
                Learn More
              </button>
            </div>
          )}
        </div>
        
        {/* Background decoration - simplified */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-citrus/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-apricot/15 rounded-full blur-xl"></div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Section */}
      <section className="py-16 px-4 bg-apple-core/10 dark:bg-blueberry/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blueberry dark:text-citrus mb-4">
              Why Choose TuneMyCV?
            </h2>
            <p className="text-lg text-blueberry/70 dark:text-apple-core max-w-xl mx-auto">
              Our AI-powered platform provides comprehensive CV optimization to help you stand out in today's competitive job market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border border-apple-core/20 dark:border-citrus/10">
              <div className="bg-apricot/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-apricot" />
              </div>
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">ATS Optimization</h3>
              <p className="text-blueberry/60 dark:text-apple-core/70 text-sm">
                Ensure your CV passes Applicant Tracking Systems with our advanced formatting and keyword optimization.
              </p>
            </div>

            <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border border-apple-core/20 dark:border-citrus/10">
              <div className="bg-citrus/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-citrus" />
              </div>
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">AI-Powered Analysis</h3>
              <p className="text-blueberry/60 dark:text-apple-core/70 text-sm">
                Get detailed feedback and personalized recommendations to improve your CV's impact and effectiveness.
              </p>
            </div>

            <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border border-apple-core/20 dark:border-citrus/10">
              <div className="bg-blueberry/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-blueberry dark:text-citrus" />
              </div>
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">Industry Expertise</h3>
              <p className="text-blueberry/60 dark:text-apple-core/70 text-sm">
                Leverage insights from thousands of successful job applications across various industries and roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-blueberry text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blueberry via-blueberry/95 to-blueberry"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-citrus">Trusted by Job Seekers Worldwide</h2>
            <p className="text-lg text-white/90">
              Join thousands of professionals who have successfully optimized their CVs with TuneMyCV
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-2 text-citrus">50,000+</div>
              <div className="text-white/90 text-sm">CVs Analyzed</div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-2 text-citrus">89%</div>
              <div className="text-white/90 text-sm">Interview Rate Increase</div>
            </div>
            <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-2 text-citrus">120+</div>
              <div className="text-white/90 text-sm">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      {!user && (
        <section className="py-16 px-4 bg-gradient-to-br from-citrus/5 via-white to-apple-core/10 dark:from-citrus/5 dark:via-gray-900 dark:to-apple-core/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blueberry dark:text-citrus mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-blueberry/70 dark:text-apple-core mb-6">
              Start optimizing your CV today and take the first step towards landing your dream job.
            </p>
            <Link
              to="/analyze"
              className="bg-apricot text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-md"
            >
              <Users className="mr-2 h-5 w-5" />
              Join TuneMyCV Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
