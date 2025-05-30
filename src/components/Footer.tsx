
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blueberry dark:bg-blueberry/90 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">TuneMyCV</h3>
            <p className="text-apple-core/80 mb-4">
              AI-powered CV analysis that helps you optimize your resume for Applicant Tracking Systems (ATS) and land your dream job.
            </p>
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
                <Link to="/help#getting-started" className="hover:text-citrus transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/help#ats-keywords" className="hover:text-citrus transition-colors">
                  What is Applicant Tracking System (ATS)?
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
