
import React from 'react';
import { Upload, Search, FileText, Download } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Simply upload your current CV and the job description you're targeting."
    },
    {
      icon: Search,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your CV against the job requirements and industry standards."
    },
    {
      icon: FileText,
      title: "Get Insights",
      description: "Receive detailed feedback with actionable recommendations to improve your application."
    },
    {
      icon: Download,
      title: "Apply with Confidence",
      description: "Download your optimized CV and personalized cover letter, then apply with confidence."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-earth dark:text-white mb-4">
            How <span className="text-zapier-orange">Tune</span>MyCV Works
          </h2>
          <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl mx-auto">
            Our streamlined process helps you optimize your CV and cover letter in just a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-zapier-orange/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <step.icon className="h-10 w-10 text-zapier-orange" />
              </div>
              
              <div className="bg-zapier-orange text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {index + 1}
              </div>
              
              <h3 className="text-xl font-bold text-earth dark:text-white mb-3">
                {step.title}
              </h3>
              
              <p className="text-earth/70 dark:text-white/70 leading-relaxed">
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
