
import React from 'react';
import { Upload, Search, FileText, Mail, Users } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Simply upload your CV and the job description you are applying for",
      image: "/placeholder.svg?height=300&width=400&text=Upload+CV"
    },
    {
      icon: Search,
      title: "AI Analysis",
      description: "TuneMyCV performs a comprehensive analysis of your compatibility for the role based on your CV",
      image: "/placeholder.svg?height=300&width=400&text=AI+Analysis"
    },
    {
      icon: FileText,
      title: "Detailed Report",
      description: "Get a detailed report with vital key information to guide you on tuning your CV to better align with the job requirements",
      image: "/placeholder.svg?height=300&width=400&text=CV+Report"
    },
    {
      icon: Mail,
      title: "Cover Letter",
      description: "We'll help you prepare a compelling cover letter to help you stand out in your application process",
      image: "/placeholder.svg?height=300&width=400&text=Cover+Letter"
    },
    {
      icon: Users,
      title: "Interview Preparation",
      description: "When you make it to interview, we'll guide you with a detailed interview script and preparation tips",
      image: "/placeholder.svg?height=300&width=400&text=Interview+Prep"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blueberry mb-4">
            How TuneMyCV Works
          </h2>
          <p className="text-xl text-blueberry/80 max-w-3xl mx-auto">
            Your journey to landing your dream job starts here. Follow our simple 5-step process to transform your career prospects.
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-apricot/20 rounded-full w-16 h-16 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-apricot" />
                    </div>
                    <div className="bg-citrus text-blueberry rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-blueberry">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-blueberry/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Image */}
                <div className="flex-1">
                  <div className="relative">
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full h-80 object-cover rounded-xl shadow-lg border-4 border-apple-core/30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-apricot/10 to-citrus/10 rounded-xl"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-blueberry mb-4">
            Ready to Transform Your Career?
          </h3>
          <p className="text-blueberry/80 mb-8">
            Join thousands of job seekers who have already improved their chances with TuneMyCV
          </p>
          <a
            href="#hero"
            className="bg-apricot text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-apricot/90 transition-colors inline-flex items-center shadow-lg"
          >
            Get Started Today
            <Upload className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
