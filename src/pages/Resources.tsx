
import React from 'react';
import { FileText, Users, BookOpen, Target, TrendingUp, CheckCircle } from 'lucide-react';

const Resources = () => {
  const topResources = [
    {
      title: "Complete CV Optimization Guide",
      description: "Master the art of creating a standout CV that gets noticed by recruiters and passes ATS systems.",
      icon: FileText,
      link: "#",
      category: "Featured"
    },
    {
      title: "Interview Success Masterclass",
      description: "Comprehensive preparation toolkit with practice questions, techniques, and confidence-building strategies.",
      icon: Users,
      link: "#",
      category: "Featured"
    },
    {
      title: "Salary Negotiation Blueprint",
      description: "Expert strategies and scripts to negotiate your worth and secure the compensation you deserve.",
      icon: TrendingUp,
      link: "#",
      category: "Featured"
    }
  ];

  const resources = [
    {
      title: "10 Common CV Mistakes to Avoid in 2025",
      icon: FileText,
      link: "#",
      category: "CV Tips"
    },
    {
      title: "ATS Optimization Guide",
      icon: Target,
      link: "#",
      category: "Technical"
    },
    {
      title: "Industry-Specific CV Templates",
      icon: BookOpen,
      link: "#",
      category: "Templates"
    },
    {
      title: "Interview Preparation Toolkit",
      icon: Users,
      link: "#",
      category: "Interview"
    },
    {
      title: "Salary Negotiation Strategies",
      icon: TrendingUp,
      link: "#",
      category: "Career"
    },
    {
      title: "LinkedIn Profile Optimization",
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
      <section className="bg-gradient-to-br from-apple-core/30 via-white to-citrus/20 dark:from-blueberry/30 dark:via-gray-900 dark:to-citrus/10 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-blueberry dark:text-citrus mb-6">
            Career Resources
          </h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core mb-4">
            Expert guides, templates, and tools to accelerate your job search and career growth
          </p>
        </div>
      </section>

      {/* Top 3 Resources Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blueberry dark:text-citrus mb-8">
            Our Top 3 Resources
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {topResources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50" style={{ height: '216px' }}>
                <div className="bg-apricot/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <resource.icon className="h-6 w-6 text-apricot" />
                </div>
                
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-zapier-orange to-apricot h-24 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Featured Image</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                </div>
                
                <a 
                  href={resource.link}
                  className="inline-flex items-center text-apricot font-medium hover:text-zapier-orange transition-colors text-sm"
                >
                  Explore →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50" style={{ height: '180px' }}>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="bg-apricot/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <resource.icon className="h-6 w-6 text-apricot" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <span className="inline-block bg-citrus/20 text-citrus px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {resource.category}
                  </span>
                  
                  <a 
                    href={resource.link}
                    className="inline-flex items-center text-apricot font-medium hover:text-zapier-orange transition-colors text-sm mt-auto"
                  >
                    Read More →
                  </a>
                </div>
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
              className="flex-1 px-4 py-3 rounded-lg text-earth focus:outline-none focus:ring-2 focus:ring-zapier-orange border border-gray-200 hover:border-zapier-orange/50 transition-colors"
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
