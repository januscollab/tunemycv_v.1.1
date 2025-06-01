
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Testimonials = () => {
  const isMobile = useIsMobile();
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Tech Corp",
      content: "TuneMyCV helped me land my dream job at a top tech company. The AI analysis identified key areas for improvement that I never would have noticed myself.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      company: "Growth Solutions",
      content: "The detailed feedback and cover letter assistance were game-changers. I went from 0 responses to 5 interview invitations in just two weeks!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Data Analyst",
      company: "Analytics Plus",
      content: "The interview preparation scripts gave me the confidence I needed. I felt so prepared and ultimately got the job with a 30% salary increase!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "David Thompson",
      role: "Product Manager",
      company: "Innovation Labs",
      content: "As someone changing careers, TuneMyCV helped me highlight transferable skills I didn't know I had. The personalized recommendations were spot-on.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Lisa Park",
      role: "UX Designer",
      company: "Design Studio",
      content: "The ATS optimization feature is brilliant. My CV now passes through applicant tracking systems that previously filtered me out automatically.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "James Wilson",
      role: "Financial Analyst",
      company: "Capital Ventures",
      content: "TuneMyCV transformed my entire job search strategy. The insights were incredibly valuable and helped me stand out from other candidates.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
    }
  ];

  // Show only first 3 testimonials on mobile
  const displayedTestimonials = isMobile ? testimonials.slice(0, 3) : testimonials;

  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blueberry dark:text-citrus mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core max-w-3xl mx-auto px-4">
            Join thousands of professionals who have transformed their careers with TuneMyCV
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedTestimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow border border-apple-core/20 dark:border-citrus/20">
              <div className="flex items-center mb-4">
                <Quote className="h-6 w-6 md:h-8 md:w-8 text-citrus mr-3" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-citrus text-citrus" />
                  ))}
                </div>
              </div>
              
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 md:mr-4 border-2 border-apple-core/30 dark:border-citrus/30"
                />
                <div>
                  <h4 className="font-semibold text-blueberry dark:text-citrus text-sm md:text-base">{testimonial.name}</h4>
                  <p className="text-xs md:text-sm text-blueberry/70 dark:text-apple-core/80">{testimonial.role}</p>
                  <p className="text-xs md:text-sm text-apricot font-medium">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isMobile && (
          <div className="text-center mt-6">
            <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
              View our full collection of testimonials on desktop
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
