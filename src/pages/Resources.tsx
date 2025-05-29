
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build a compelling CV and advance your career. From templates to expert advice.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {resourceCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <category.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Explore All →
              </button>
            </div>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">Join Thousands of Successful Job Seekers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">CVs Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">85%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">15k+</div>
              <div className="text-blue-100">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
