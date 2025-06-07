
import React from 'react';
import { Upload, Search, FileText } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="h-12 w-12 text-zapier-orange" />,
      title: "Upload Your CV",
      description: "Simply upload your CV in PDF, DOC, or DOCX format. Our AI will extract and analyze your professional information instantly."
    },
    {
      icon: <Search className="h-12 w-12 text-zapier-orange" />,
      title: "Analyze & Match", 
      description: "Paste any job description and our AI will analyze the match between your CV and the role, highlighting strengths and improvement areas."
    },
    {
      icon: <FileText className="h-12 w-12 text-zapier-orange" />,
      title: "Ready. Set. Interview.",
      description: "Our Interview Toolkit will help you with a tailored cover letter and a complete interview prep pack — so you're fully equipped to succeed"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, index) => (
        <div key={index} className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {step.icon}
              <div className="absolute -top-2 -right-2 bg-zapier-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-caption font-bold">
                {index + 1}
              </div>
            </div>
          </div>
          <h3 className="text-heading font-semibold text-foreground mb-4">
            {step.title}
          </h3>
          <p className="text-foreground-secondary">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HowItWorks;
