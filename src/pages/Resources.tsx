
import { BookOpen, Download, Video, Users, Award, TrendingUp } from 'lucide-react';

const Resources = () => {
  const resourceCategories = [
    {
      title: "CV Templates",
      icon: Download,
      description: "Professional CV templates for different industries",
      items: ["Modern Template", "Executive Template", "Creative Template", "Academic Template"]
    },
    {
      title: "Video Guides",
      icon: Video,
      description: "Step-by-step video tutorials on CV optimization",
      items: ["Writing Effective Summaries", "Showcasing Achievements", "Industry-Specific Tips", "Interview Preparation"]
    },
    {
      title: "Career Advice",
      icon: BookOpen,
      description: "Expert articles on career development and job search",
      items: ["Networking Strategies", "Salary Negotiation", "Career Transitions", "LinkedIn Optimization"]
    }
  ];

  const featuredArticles = [
    {
      title: "10 Common CV Mistakes to Avoid in 2024",
      category: "CV Tips",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop"
    },
    {
      title: "How to Tailor Your CV for Different Industries",
      category: "Industry Insights",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"
    },
    {
      title: "The Future of CV Screening: AI and ATS Systems",
      category: "Technology",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-blueberry/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Career Resources</h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-3xl mx-auto">
            Everything you need to build a compelling CV and advance your career. From templates to expert advice.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {resourceCategories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-blueberry/20 rounded-lg shadow-lg p-6 border border-apple-core/30 dark:border-citrus/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <category.icon className="h-8 w-8 text-apricot mr-3" />
                <h3 className="text-xl font-semibold text-blueberry dark:text-citrus">{category.title}</h3>
              </div>
              <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-blueberry/80 dark:text-apple-core/90">
                    <div className="w-2 h-2 bg-citrus rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-4 text-apricot font-medium hover:text-apricot/80 transition-colors">
                Explore All →
              </button>
            </div>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-blueberry dark:text-citrus mb-8 text-center">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <div key={index} className="bg-white dark:bg-blueberry/20 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-apple-core/30 dark:border-citrus/20">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-citrus/20 text-blueberry dark:text-citrus text-xs font-medium px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="text-blueberry/60 dark:text-apple-core/70 text-sm ml-2">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">{article.title}</h3>
                  <button className="text-apricot font-medium hover:text-apricot/80 transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-blueberry via-blueberry/90 to-blueberry/80 rounded-lg p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blueberry/90 via-blueberry/70 to-blueberry/90"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-8 text-citrus">Join Thousands of Successful Job Seekers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-apple-core/20">
                <div className="text-3xl font-bold mb-2 text-citrus">50,000+</div>
                <div className="text-apple-core">CVs Analyzed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-apple-core/20">
                <div className="text-3xl font-bold mb-2 text-citrus">85%</div>
                <div className="text-apple-core">Success Rate</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-apple-core/20">
                <div className="text-3xl font-bold mb-2 text-citrus">15k+</div>
                <div className="text-apple-core">Happy Users</div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-citrus/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-apricot/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
