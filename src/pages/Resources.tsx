
import React from 'react';
import { FileText, Users, BookOpen, Target, TrendingUp, CheckCircle } from 'lucide-react';

const Resources = () => {
  const resources = [
    {
      title: "10 Common CV Mistakes to Avoid in 2025",
      description: "Learn about the most frequent errors that can cost you job opportunities and how to fix them.",
      icon: FileText,
      link: "#",
      category: "CV Tips"
    },
    {
      title: "ATS Optimization Guide",
      description: "Master the art of making your CV readable by Applicant Tracking Systems.",
      icon: Target,
      link: "#",
      category: "Technical"
    },
    {
      title: "Industry-Specific CV Templates",
      description: "Download professionally designed CV templates tailored to your industry.",
      icon: BookOpen,
      link: "#",
      category: "Templates"
    },
    {
      title: "Interview Preparation Toolkit",
      description: "Comprehensive guide to preparing for job interviews with practice questions.",
      icon: Users,
      link: "#",
      category: "Interview"
    },
    {
      title: "Salary Negotiation Strategies",
      description: "Expert tips on how to negotiate your salary and benefits package effectively.",
      icon: TrendingUp,
      link: "#",
      category: "Career"
    },
    {
      title: "LinkedIn Profile Optimization",
      description: "Transform your LinkedIn profile to attract recruiters and opportunities.",
      icon: CheckCircle,
      link: "#",
      category: "Social Media"
    }
  ];

  const categories = [
    "All",
    "CV Tips",
    "Technical",
    "Templates", 
    "Interview",
    "Career",
    "Social Media"
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredResources = selectedCategory === "All" 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-apple-core/30 via-white to-citrus/20 dark:from-blueberry/30 dark:via-gray-900 dark:to-citrus/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-blueberry dark:text-citrus mb-6">
            Career Resources
          </h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core mb-8">
            Expert guides, templates, and tools to accelerate your job search and career growth
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-zapier-orange text-white'
                    : 'bg-white dark:bg-blueberry/20 text-blueberry dark:text-apple-core border border-apple-core/30 dark:border-citrus/20 hover:border-zapier-orange hover:text-zapier-orange'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-apple-core/20 dark:border-citrus/20">
                <div className="bg-apricot/20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <resource.icon className="h-8 w-8 text-apricot" />
                </div>
                
                <div className="mb-4">
                  <span className="inline-block bg-citrus/20 text-citrus px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {resource.category}
                  </span>
                  <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-blueberry/70 dark:text-apple-core/80 leading-relaxed">
                    {resource.description}
                  </p>
                </div>
                
                <a 
                  href={resource.link}
                  className="inline-flex items-center text-apricot font-medium hover:text-apricot/80 transition-colors"
                >
                  Read More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-cream/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-earth">Stay Updated</h2>
          <p className="text-xl mb-8 text-earth/70">
            Get the latest career tips, CV trends, and job market insights delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-earth focus:outline-none focus:ring-2 focus:ring-zapier-orange"
            />
            <button className="bg-zapier-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-zapier-orange/90 transition-colors">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm text-earth/60 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>
    </div>
  );
};

export default Resources;
