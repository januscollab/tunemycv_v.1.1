
import React from 'react';
import { FileText, Users, BookOpen, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const Resources = () => {
  const resources = [
    {
      title: "10 Common CV Mistakes to Avoid in 2025",
      description: "Learn the most frequent errors job seekers make on their CVs and how to avoid them to increase your chances of landing interviews.",
      link: "#",
      category: "CV Tips"
    },
    {
      title: "ATS Optimization Guide",
      description: "Comprehensive guide to making your CV pass through Applicant Tracking Systems with the right keywords and formatting.",
      link: "#",
      category: "Technical"
    },
    {
      title: "Industry-Specific CV Templates",
      description: "Professional CV templates tailored for different industries including tech, finance, healthcare, and creative fields.",
      link: "#",
      category: "Templates"
    },
    {
      title: "Interview Preparation Toolkit",
      description: "Essential tools and strategies to help you prepare for any interview, from research techniques to common questions.",
      link: "#",
      category: "Interview"
    },
    {
      title: "Salary Negotiation Strategies",
      description: "Master the art of salary negotiation with proven techniques and scripts to maximize your earning potential.",
      link: "#",
      category: "Career"
    },
    {
      title: "LinkedIn Profile Optimization",
      description: "Step-by-step guide to creating a compelling LinkedIn profile that attracts recruiters and networking opportunities.",
      link: "#",
      category: "Social Media"
    },
    {
      title: "Complete CV Optimization Guide",
      description: "The ultimate guide to transforming your CV from average to outstanding with detailed examples and templates.",
      link: "#",
      category: "CV Tips"
    },
    {
      title: "Interview Success Masterclass",
      description: "Advanced interview techniques covering body language, storytelling, and how to handle difficult questions.",
      link: "#",
      category: "Interview"
    },
    {
      title: "Salary Negotiation Blueprint",
      description: "Detailed blueprint for negotiating not just salary but benefits, remote work, and career advancement opportunities.",
      link: "#",
      category: "Career"
    }
  ];

  const topResources = [
    {
      title: "CV Analysis Best Practices",
      description: "Essential guide to understanding what makes a CV effective in today's job market.",
      link: "#"
    },
    {
      title: "Cover Letter Writing Guide",
      description: "Create compelling cover letters that complement your CV and showcase your personality.",
      link: "#"
    },
    {
      title: "Job Search Strategy Framework",
      description: "Systematic approach to job searching that saves time and increases success rates.",
      link: "#"
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
      {/* Work in Progress Banner */}
      <div className="bg-zapier-orange/10 border-b border-zapier-orange/20 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3">
            <AlertCircle className="h-5 w-5 text-zapier-orange" />
            <p className="text-sm text-zapier-orange font-medium">
              📚 Work in Progress: We're adding vital career resources. Check back soon for updates!
            </p>
          </div>
        </div>
      </div>

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

      {/* Our Top 3 Resources */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-earth dark:text-white mb-4">
              Our Top 3 Must Reads
            </h2>
            <p className="text-xl text-earth/70 dark:text-white/70">
              Start with these essential guides that have helped thousands of job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topResources.map((resource, index) => (
              <div key={index} className="bg-gradient-to-br from-zapier-orange/10 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-shadow border border-zapier-orange/20">
                <div className="flex items-center mb-4">
                  <div className="bg-zapier-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                    {index + 1}
                  </div>
                  <CheckCircle className="h-5 w-5 text-zapier-orange" />
                </div>
                <h3 className="text-xl font-semibold text-earth dark:text-white mb-3">
                  {resource.title}
                </h3>
                <p className="text-earth/70 dark:text-white/70 mb-4 text-sm leading-relaxed">
                  {resource.description}
                </p>
                <a 
                  href={resource.link}
                  className="inline-flex items-center text-zapier-orange font-medium hover:text-zapier-orange/80 transition-colors text-sm"
                >
                  Read More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto" style={{ width: '80%' }}>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-zapier-orange text-white'
                    : 'bg-white dark:bg-surface-secondary text-earth dark:text-white border border-border dark:border-border-secondary hover:border-zapier-orange hover:text-zapier-orange'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-white/80 mb-4 flex-grow leading-relaxed">
                    {resource.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                      {resource.category}
                    </span>
                    
                    <a 
                      href={resource.link}
                      className="inline-flex items-center text-zapier-orange font-medium hover:text-zapier-orange/80 transition-colors text-sm"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-cream/30 dark:bg-surface-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-earth dark:text-white">Stay Updated</h2>
          <p className="text-xl mb-8 text-earth/70 dark:text-white/70">
            Get the latest career tips, CV trends, and job market insights delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-earth dark:text-white bg-white dark:bg-surface placeholder:text-earth/70 dark:placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-zapier-orange border border-gray-200 dark:border-border hover:border-zapier-orange/50 transition-colors"
            />
            <button className="bg-zapier-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-zapier-orange/90 transition-colors">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm text-earth/60 dark:text-white/60 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>
    </div>
  );
};

export default Resources;
