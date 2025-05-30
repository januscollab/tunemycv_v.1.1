
import React from 'react';
import { Upload, Zap, Target, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Simply upload your current CV and any job description you're targeting. Our system supports multiple file formats."
    },
    {
      icon: Zap,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your CV against industry standards and ATS requirements, identifying strengths and areas for improvement."
    },
    {
      icon: Target,
      title: "Get Recommendations",
      description: "Receive detailed, actionable feedback including keyword optimization, formatting suggestions, and content improvements."
    },
    {
      icon: TrendingUp,
      title: "Land Your Dream Job",
      description: "Apply with confidence using your optimized CV and watch your interview rate increase significantly."
    }
  ];

  const FunArrow = () => (
    <div className="hidden lg:flex items-center justify-center">
      <svg width="60" height="40" viewBox="0 0 60 40" className="text-apricot">
        <path
          d="M5 20 Q 30 5, 55 20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50 15 L55 20 L50 25"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="18" r="2" fill="currentColor" opacity="0.6" />
        <circle cx="25" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
        <circle cx="35" cy="15" r="1" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
  );

  return (
    <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">
            How TuneMyCV Works
          </h2>
          <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-3xl mx-auto">
            Transform your CV in four simple steps and increase your chances of landing your dream job
          </p>
        </div>

        <div className="grid lg:grid-cols-7 gap-8 items-center">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="lg:col-span-1 text-center">
                <div className="bg-gradient-to-br from-citrus/20 to-apricot/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-citrus/30">
                  <step.icon className="h-10 w-10 text-apricot" />
                </div>
                <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">
                  {step.title}
                </h3>
                <p className="text-blueberry/70 dark:text-apple-core/80 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="lg:col-span-1">
                  <FunArrow />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
