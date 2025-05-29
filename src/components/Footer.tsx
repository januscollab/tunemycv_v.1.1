
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blueberry via-blueberry/90 to-blueberry/80 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blueberry/90 via-blueberry/70 to-blueberry/90"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/uploaded-logo.png" 
                alt="TuneMyCV Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-apple-core mb-4 max-w-md">
              Optimize your CV and increase your chances of landing your dream job with our AI-powered analysis and personalized recommendations.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-apple-core">
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
                <Link to="/" className="text-apple-core hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="text-apple-core hover:text-white transition-colors">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-apple-core hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-apple-core hover:text-white transition-colors">
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
                <Link to="/help" className="text-apple-core hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-apple-core hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-apple-core hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-apple-core hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blueberry/40 mt-8 pt-8 text-center">
          <p className="text-apple-core">
            © {new Date().getFullYear()} TuneMyCV. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-citrus/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-apricot/10 rounded-full blur-2xl"></div>
    </footer>
  );
};

export default Footer;
