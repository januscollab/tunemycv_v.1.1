
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
      <section id="hero" className="bg-gradient-to-br from-apple-core/30 via-white to-citrus/20 dark:from-blueberry/30 dark:via-gray-900 dark:to-citrus/10 py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blueberry dark:text-citrus mb-4 md:mb-6 px-2">
            Optimize Your CV,
            <span className="text-apricot block sm:inline"> Accelerate Your Career</span>
          </h1>
          <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core mb-6 md:mb-8 max-w-3xl mx-auto px-4">
            TuneMyCV is an AI-powered platform that helps job seekers improve their CVs, 
            pass ATS systems, and increase their chances of landing their dream job.
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link
                to="/analyze"
                className="w-full sm:w-auto bg-apricot text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center justify-center shadow-lg"
              >
                <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Analyze Your CV
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                to="/profile"
                className="w-full sm:w-auto border-2 border-blueberry dark:border-citrus text-blueberry dark:text-citrus px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:border-apricot hover:text-apricot transition-colors text-center"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto bg-apricot text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center justify-center shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <button
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto border-2 border-blueberry dark:border-citrus text-blueberry dark:text-citrus px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:border-apricot hover:text-apricot transition-colors"
              >
                Learn More
              </button>
            </div>
          )}
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-20 h-20 md:w-32 md:h-32 bg-citrus/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 md:w-40 md:h-40 bg-apricot/20 rounded-full blur-xl"></div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-apple-core/20 dark:bg-blueberry/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blueberry dark:text-citrus mb-4">
              Why Choose TuneMyCV?
            </h2>
            <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto px-4">
              Our AI-powered platform provides comprehensive CV optimization to help you stand out in today's competitive job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 md:p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30 dark:border-citrus/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-bl from-citrus/20 to-transparent rounded-bl-full"></div>
              <div className="bg-apricot/20 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10">
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-apricot" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-blueberry dark:text-citrus mb-3 md:mb-4">ATS Optimization</h3>
              <p className="text-sm md:text-base text-blueberry/70 dark:text-apple-core/80">
                Ensure your CV passes Applicant Tracking Systems with our advanced formatting and keyword optimization.
              </p>
            </div>

            <div className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 md:p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30 dark:border-citrus/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-bl from-apricot/20 to-transparent rounded-bl-full"></div>
              <div className="bg-citrus/20 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-citrus" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-blueberry dark:text-citrus mb-3 md:mb-4">AI-Powered Analysis</h3>
              <p className="text-sm md:text-base text-blueberry/70 dark:text-apple-core/80">
                Get detailed feedback and personalized recommendations to improve your CV's impact and effectiveness.
              </p>
            </div>

            <div className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 md:p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30 dark:border-citrus/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-bl from-blueberry/20 to-transparent rounded-bl-full"></div>
              <div className="bg-blueberry/20 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-blueberry dark:text-citrus" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-blueberry dark:text-citrus mb-3 md:mb-4">Industry Expertise</h3>
              <p className="text-sm md:text-base text-blueberry/70 dark:text-apple-core/80">
                Leverage insights from thousands of successful job applications across various industries and roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-blueberry via-blueberry/90 to-blueberry/80 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blueberry/90 via-blueberry/70 to-blueberry/90"></div>
          <div className="absolute top-0 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-citrus/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 md:w-96 md:h-96 bg-apricot/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-apple-core/10 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-citrus">Trusted by Job Seekers Worldwide</h2>
            <p className="text-lg md:text-xl text-white/90 px-4">
              Join thousands of professionals who have successfully optimized their CVs with TuneMyCV
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="bg-white/10 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-citrus">50,000+</div>
              <div className="text-sm md:text-base text-white/90">CVs Analyzed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-citrus">89%</div>
              <div className="text-sm md:text-base text-white/90">Interview Rate Increase</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-citrus">120+</div>
              <div className="text-sm md:text-base text-white/90">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      {!user && (
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-citrus/10 via-white to-apple-core/20 dark:from-citrus/5 dark:via-gray-900 dark:to-apple-core/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-blueberry dark:text-citrus mb-4 md:mb-6 px-2">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core mb-6 md:mb-8 px-4">
              Start optimizing your CV today and take the first step towards landing your dream job.
            </p>
            <Link
              to="/auth"
              className="bg-apricot text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-lg"
            >
              <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Join TuneMyCV Today
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
