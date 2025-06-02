
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-earth text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/7aefb742-801d-4494-af3e-defd30462f1c.png" 
                alt="TuneMyCV Logo" 
                className="h-8 w-auto mr-2"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              AI-powered CV optimization platform helping job seekers improve their applications and increase interview success rates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/cover-letter" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Cover Letter
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/next-steps" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Next Steps
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-centre" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@tunemycv.com" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-zapier-orange transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} TuneMyCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
