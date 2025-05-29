
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blueberry text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                <FileText className="h-8 w-8 text-citrus" />
                <TrendingUp className="h-6 w-6 text-apricot" />
              </div>
              <span className="text-2xl font-bold">TuneMyCV</span>
            </Link>
            <p className="text-apple-core mb-4 max-w-md">
              Optimize your CV and increase your chances of landing your dream job with our AI-powered analysis and personalized recommendations.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-apple-core">
                <Mail className="h-4 w-4 mr-2 text-citrus" />
                <span className="text-sm">hello@tunemycv.com</span>
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
    </footer>
  );
};

export default Footer;
