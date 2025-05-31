
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blueberry dark:bg-blueberry/90 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/7aefb742-801d-4494-af3e-defd30462f1c.png" 
                alt="TuneMyCV" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-apple-core/80 mb-4">
              AI-powered CV analysis that helps you optimize your resume for Applicant Tracking Systems (ATS) and land your dream job.
            </p>
            <div className="mb-4">
              <a 
                href="mailto:hello@tunemycv.com"
                className="flex items-center text-apple-core/80 hover:text-citrus transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                hello@tunemycv.com
              </a>
            </div>
            <p className="text-sm text-apple-core/60">
              © 2024 TuneMyCV. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-apple-core/80">
              <li>
                <Link to="/analyze" className="hover:text-citrus transition-colors">
                  Analyze CV
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-citrus transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-citrus transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-citrus transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-apple-core/80">
              <li>
                <Link to="/help" className="hover:text-citrus transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-citrus transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-citrus transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/help#ats-keywords" className="hover:text-citrus transition-colors">
                  What is Applicant Tracking System (ATS)?
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-citrus transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
