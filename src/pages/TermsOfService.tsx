
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none text-blueberry/80 dark:text-apple-core/90">
            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using TuneMyCV, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily use TuneMyCV for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">3. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
            </p>

            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">4. Service Availability</h2>
            <p>
              TuneMyCV is currently in beta. We do not guarantee continuous, uninterrupted, or secure access to our services.
            </p>

            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">5. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:hello@tunemycv.com" className="text-zapier-orange hover:underline">
                hello@tunemycv.com
              </a>
            </p>

            <p className="text-sm text-blueberry/60 dark:text-apple-core/70 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
