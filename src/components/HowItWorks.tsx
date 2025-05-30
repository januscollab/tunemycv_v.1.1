
import React from 'react';
import { Upload, Zap, Target, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Simply upload your current CV and any job description you're targeting. Our system supports multiple file formats.",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: Zap,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your CV against industry standards and ATS requirements, identifying strengths and areas for improvement.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: Target,
      title: "Get Recommendations",
      description: "Receive detailed, actionable feedback including keyword optimization, formatting suggestions, and content improvements.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: TrendingUp,
      title: "Land Your Dream Job",
      description: "Apply with confidence using your optimized CV and watch your interview rate increase significantly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center"
    }
  ];

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-br from-citrus/20 to-apricot/20 rounded-lg overflow-hidden mb-6 border border-citrus/30">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="bg-gradient-to-br from-citrus/20 to-apricot/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-citrus/30">
                    <step.icon className="h-8 w-8 text-apricot" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">
                {step.title}
              </h3>
              <p className="text-blueberry/70 dark:text-apple-core/80 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
