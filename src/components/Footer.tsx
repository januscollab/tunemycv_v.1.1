
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-earth dark:bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/0a954f23-ade3-4c24-8a1a-d548bf6299d2.png" 
                alt="TuneMyCV" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              AI-powered CV analysis and optimization to help you land your dream job. 
              Get personalized feedback and improve your chances with every application.
            </p>
            <div className="flex items-center mb-4">
              <Mail className="h-4 w-4 mr-2 text-white/80" />
              <a 
                href="mailto:hello@tunemycv.com" 
                className="text-white/80 hover:text-zapier-orange transition-colors"
              >
                hello@tunemycv.com
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/cover-letter" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Cover Letter
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/next-steps" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Next Steps
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-centre" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-white/80 hover:text-zapier-orange transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © 2024 <span className="text-zapier-orange">Tune</span>MyCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
