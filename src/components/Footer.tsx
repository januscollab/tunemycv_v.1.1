
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blueberry via-blueberry/90 to-blueberry/80 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blueberry/90 via-blueberry/70 to-blueberry/90"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-citrus/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-apricot/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-apple-core/10 rounded-full blur-2xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/7aefb742-801d-4494-af3e-defd30462f1c.png" 
                alt="TuneMyCV Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-white/90 mb-4 max-w-md">
              Optimize your CV and increase your chances of landing your dream job with our AI-powered analysis and personalized recommendations.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-white/90">
                <Mail className="h-4 w-4 mr-2 text-citrus" />
                <a 
                  href="mailto:hello@tunemycv.com"
                  className="text-sm hover:text-citrus transition-colors"
                >
                  hello@tunemycv.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-citrus">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/90 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="text-white/90 hover:text-white transition-colors">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/90 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white/90 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-citrus">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-white/90 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/90 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/90 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/90 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/90">
            © {new Date().getFullYear()} TuneMyCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
