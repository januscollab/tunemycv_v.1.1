
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { ContactFormModal } from '@/components/ui/contact-form-modal';

const Footer = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <footer className="bg-earth dark:bg-card text-earth-foreground py-space-3">
      <div className="max-w-6xl mx-auto px-space-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-2">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-space-1">
              <img 
                src="/lovable-uploads/0a954f23-ade3-4c24-8a1a-d548bf6299d2.png" 
                alt="TuneMyCV" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-earth-foreground/80 mb-space-1 max-w-md">
              AI-powered CV analysis and optimization to help you land your dream job. 
              Get personalized feedback and improve your chances with every application.
            </p>
            <div className="flex items-center mb-space-1">
              <Mail className="h-4 w-4 mr-2 text-earth-foreground/80" />
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="text-earth-foreground/80 hover:text-zapier-orange transition-colors cursor-pointer underline"
              >
                hello@tunemycv.com
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-space-1">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/cover-letter" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Cover Letter
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/next-steps" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Next Steps
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-space-1">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-centre" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="text-earth-foreground/80 hover:text-zapier-orange transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-earth-foreground/80 hover:text-zapier-orange transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-earth-foreground/20 mt-space-2 pt-space-2 text-center">
          <p className="text-earth-foreground/60">
            © 2024 <span className="text-zapier-orange">Tune</span>MyCV. All rights reserved.
          </p>
        </div>
      </div>
      
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
