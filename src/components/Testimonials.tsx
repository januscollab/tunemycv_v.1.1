
import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
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

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-display font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-heading text-muted-foreground max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their careers with <span className="text-primary">Tune</span>MyCV
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-border ${
                index >= 3 ? 'hidden md:block' : ''
              } ${index >= 3 ? 'lg:block' : ''}`}
            >
              <div className="flex items-center mb-4">
                <Quote className="h-8 w-8 text-primary mr-3" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 border-2 border-border"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-caption text-muted-foreground">{testimonial.role}</p>
                  <p className="text-caption text-primary font-medium">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
