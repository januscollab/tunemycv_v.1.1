
import { ArrowRight, CheckCircle, TrendingUp, Users, Star, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-apple-core/30 via-white to-citrus/20 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-blueberry mb-6">
            Optimize Your CV,
            <span className="text-apricot"> Accelerate Your Career</span>
          </h1>
          <p className="text-xl text-blueberry/80 mb-8 max-w-3xl mx-auto">
            TuneMyCV is an AI-powered platform that helps job seekers improve their CVs, 
            pass ATS systems, and increase their chances of landing their dream job.
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/analyze"
                className="bg-apricot text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Analyze Your CV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className="border-2 border-blueberry text-blueberry px-8 py-4 rounded-lg text-lg font-semibold hover:border-apricot hover:text-apricot transition-colors"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth"
                className="bg-apricot text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/resources"
                className="border-2 border-blueberry text-blueberry px-8 py-4 rounded-lg text-lg font-semibold hover:border-apricot hover:text-apricot transition-colors"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-apple-core/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blueberry mb-4">
              Why Choose TuneMyCV?
            </h2>
            <p className="text-xl text-blueberry/80 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive CV optimization to help you stand out in today's competitive job market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30">
              <div className="bg-apricot/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-apricot" />
              </div>
              <h3 className="text-xl font-semibold text-blueberry mb-4">ATS Optimization</h3>
              <p className="text-blueberry/70">
                Ensure your CV passes Applicant Tracking Systems with our advanced formatting and keyword optimization.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30">
              <div className="bg-citrus/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-citrus" />
              </div>
              <h3 className="text-xl font-semibold text-blueberry mb-4">AI-Powered Analysis</h3>
              <p className="text-blueberry/70">
                Get detailed feedback and personalized recommendations to improve your CV's impact and effectiveness.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border border-apple-core/30">
              <div className="bg-blueberry/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-blueberry" />
              </div>
              <h3 className="text-xl font-semibold text-blueberry mb-4">Industry Expertise</h3>
              <p className="text-blueberry/70">
                Leverage insights from thousands of successful job applications across various industries and roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-blueberry text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Job Seekers Worldwide</h2>
            <p className="text-xl text-apple-core">
              Join thousands of professionals who have successfully optimized their CVs with TuneMyCV
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-citrus">50,000+</div>
              <div className="text-apple-core">CVs Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-citrus">89%</div>
              <div className="text-apple-core">Interview Rate Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-citrus">120+</div>
              <div className="text-apple-core">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-blueberry mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blueberry/80 mb-8">
              Start optimizing your CV today and take the first step towards landing your dream job.
            </p>
            <Link
              to="/auth"
              className="bg-apricot text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-lg"
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
