
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-earth text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/3a4313a6-1ceb-4eea-93eb-0619b6452a30.png" 
                alt="TuneMyCV Logo" 
                className="h-8 w-auto mr-2"
              />
            </div>
            <p className="text-white/80 leading-relaxed">
              Optimize your CV with AI-powered insights and accelerate your career journey.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-zapier-orange">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="text-white/80 hover:text-white transition-colors">
                  CV Analysis
                </Link>
              </li>
              <li>
                <Link to="/cover-letter" className="text-white/80 hover:text-white transition-colors">
                  Cover Letter Generator
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/80 hover:text-white transition-colors">
                  Career Resources
                </Link>
              </li>
              <li>
                <Link to="/next-steps" className="text-white/80 hover:text-white transition-colors">
                  Next Steps
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-zapier-orange">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-centre" className="text-white/80 hover:text-white transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-white/80 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-zapier-orange">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © 2024 TuneMyCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
