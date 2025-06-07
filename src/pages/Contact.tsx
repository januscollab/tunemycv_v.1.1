
import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-display font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-blueberry/70 dark:text-apple-core/80">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-zapier-orange mr-3" />
              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus">Email Us</h3>
            </div>
            <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:hello@tunemycv.com" 
              className="text-zapier-orange hover:underline font-medium"
            >
              hello@tunemycv.com
            </a>
          </div>

          <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-zapier-orange mr-3" />
              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus">Feedback</h3>
            </div>
            <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
              Use our floating feedback tab on the right to share your thoughts and suggestions.
            </p>
            <p className="text-sm text-blueberry/60 dark:text-apple-core/70">
              We're in beta and value your input!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
