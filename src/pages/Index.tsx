
import { ArrowRight, CheckCircle, TrendingUp, Users, Star, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';

const Index = () => {
  const { user } = useAuth();
  
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="hero" className="bg-background py-20 px-4 relative overflow-hidden">
        <div className="max-w-[80%] mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-earth mb-8 leading-tight font-poppins">
            Optimize Your CV, <span className="text-zapier-orange">Accelerate Your Career</span>
          </h1>
          <p className="text-earth/70 mb-10 max-w-2xl mx-auto leading-relaxed font-normal text-center text-lg">TuneMyCV is an AI-powered platform trained on our models that helps job seekers improve their CVs, generate impactful cover letters, and increase their chances of landing their dream job.</p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/analyze" className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center">
                <Upload className="mr-2 h-5 w-5 text-white" />
                Analyze Your CV
                <ArrowRight className="ml-2 h-5 w-5 text-white" />
              </Link>
              <Link to="/cover-letter" className="border-2 border-zapier-orange text-zapier-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange hover:text-white transition-colors">
                Generate Cover Letter
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/analyze" className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 text-white" />
              </Link>
              <button onClick={scrollToHowItWorks} className="border-2 border-zapier-orange text-zapier-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Section */}
      <section className="py-20 px-4 bg-cream/30">
        <div className="max-w-[80%] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-earth mb-6">
              Why Choose TuneMyCV?
            </h2>
            <p className="text-xl text-earth/70 max-w-xl mx-auto">
              Our AI-powered platform provides comprehensive CV optimization to help you stand out in today's competitive job market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-border p-8 text-center hover:border-zapier-orange transition-colors">
              <div className="bg-zapier-orange/10 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-xl font-bold text-earth mb-4">ATS Optimization</h3>
              <p className="text-earth/60 leading-relaxed">
                Ensure your CV passes Applicant Tracking Systems with our advanced formatting and keyword optimization.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-border p-8 text-center hover:border-zapier-orange transition-colors">
              <div className="bg-zapier-orange/10 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-xl font-bold text-earth mb-4">AI-Powered Analysis</h3>
              <p className="text-earth/60 leading-relaxed">
                Get detailed feedback and personalized recommendations to improve your CV's impact and effectiveness.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-border p-8 text-center hover:border-zapier-orange transition-colors">
              <div className="bg-zapier-orange/10 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-zapier-orange" />
              </div>
              <h3 className="text-xl font-bold text-earth mb-4">Industry Expertise</h3>
              <p className="text-earth/60 leading-relaxed">
                Leverage insights from thousands of successful job applications across various industries and roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-earth text-white relative overflow-hidden">
        <div className="max-w-[80%] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">Trusted by Job Seekers Worldwide</h2>
            <p className="text-xl text-white/90">
              Join thousands of professionals who have successfully optimized their CVs with TuneMyCV
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold mb-3 text-zapier-orange">50,000+</div>
              <div className="text-white/90">CVs Analyzed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold mb-3 text-zapier-orange">89%</div>
              <div className="text-white/90">Interview Rate Increase</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold mb-3 text-zapier-orange">120+</div>
              <div className="text-white/90">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-cream/30">
          <div className="max-w-[80%] mx-auto text-center">
            <h2 className="text-4xl font-bold text-earth mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-earth/70 mb-8">
              Start optimizing your CV today and take the first step towards landing your dream job.
            </p>
            <Link to="/analyze" className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors inline-flex items-center">
              <Users className="mr-2 h-5 w-5 text-white" />
              Join TuneMyCV Today
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
