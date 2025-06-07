import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, MessageSquare, ArrowRight, Target, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MainFeaturesSection = () => {
  const { user } = useAuth();

  const features = [
    {
      id: 'cv-analysis',
      title: 'CV Analysis',
      subtitle: 'AI-Powered Career Intelligence',
      description: 'Get detailed compatibility scoring, keyword optimization, and personalized recommendations to align your CV with job requirements.',
      icon: <FileText className="h-12 w-12 text-zapier-orange" />,
      link: user ? "/analyze" : "/auth",
      benefits: [
        'Compatibility scoring against job descriptions',
        'ATS optimization recommendations',
        'Skills gap analysis & improvement suggestions'
      ],
      gradient: 'from-zapier-orange/10 via-primary-100/20 to-primary-200/10'
    },
    {
      id: 'cover-letters',
      title: 'Cover Letters',
      subtitle: 'Personalized & Professional',
      description: 'Generate compelling, tailored cover letters that highlight your strengths and perfectly match each job opportunity.',
      icon: <Edit className="h-12 w-12 text-primary-600" />,
      link: user ? "/cover-letter" : "/auth",
      benefits: [
        'Tailored to specific job requirements',
        'Professional tone & structure',
        'Multiple format options'
      ],
      gradient: 'from-primary-100/10 via-primary-200/20 to-primary-300/10'
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      subtitle: 'Complete Interview Toolkit',
      description: 'Access comprehensive interview preparation with company insights, practice questions, and strategic tips to ace any interview.',
      icon: <MessageSquare className="h-12 w-12 text-primary-700" />,
      link: user ? "/interview-toolkit" : "/auth",
      benefits: [
        'Company-specific research & insights',
        'Strategic interview questions',
        'Confidence-building preparation'
      ],
      gradient: 'from-primary-200/10 via-primary-300/20 to-primary-400/10'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-cream/20 via-white to-primary-50/10 dark:from-background-secondary/30 dark:via-background dark:to-primary-50/5">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          
          <h2 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-6 leading-tight">
            Three Powerful Tools,
            <span className="text-zapier-orange"> One Career Goal</span>
          </h2>
          
          <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
            Our integrated suite of AI-powered tools works together to optimize every aspect of your job search—from CV analysis to interview success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className={`relative group overflow-hidden bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 border border-border/50 hover:border-zapier-orange/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
            >
              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-earth dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-zapier-orange mb-3">
                  {feature.subtitle}
                </p>
                <p className="text-earth/70 dark:text-white/70 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm text-earth/60 dark:text-white/60">
                      <Zap className="h-3 w-3 text-zapier-orange mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                to={feature.link}
                className="inline-flex items-center text-zapier-orange font-semibold hover:text-zapier-orange/80 transition-colors group-hover:translate-x-1 transform duration-200"
              >
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>

              {/* Number indicator */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-zapier-orange/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-zapier-orange">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-surface-secondary rounded-full px-6 py-3 shadow-md border border-border/50">
            <Users className="h-5 w-5 text-zapier-orange" />
            <span className="text-sm text-earth/70 dark:text-white/70">
              Join 10,000+ professionals who've landed their dream jobs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainFeaturesSection;