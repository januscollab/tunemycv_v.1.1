
import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow-sm border border-apple-core/20 dark:border-citrus/20 p-8">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-3xl font-bold text-blueberry dark:text-citrus mb-2">PRIVACY POLICY</h1>
            <p className="text-blueberry/70 dark:text-apple-core/80 mb-8"><strong>Last Updated: May 31, 2025</strong></p>
            
            <div className="bg-citrus/10 dark:bg-citrus/20 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">PRIVACY POLICY HIGHLIGHTS</h2>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90">
                <li>• When you register an account, use our services, or make a purchase, you voluntarily share certain information with us, including your name, email address, resume/CV content, and payment information.</li>
                <li>• We use tracking technologies such as cookies to measure usage and provide information that we believe will be of most interest to you.</li>
                <li>• We may collect additional information if you access our site through a mobile device.</li>
                <li>• We store your information for as long as necessary to provide our services and comply with legal obligations.</li>
                <li>• You can control how and when you want to receive information from us, request deletion of your information, and request a copy of your data.</li>
                <li>• We comply with applicable data protection regulations including GDPR and CCPA/CPRA.</li>
                <li>• Questions about this Privacy Policy may be sent to <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">TABLE OF CONTENTS</h2>
            <ol className="space-y-1 text-blueberry/80 dark:text-apple-core/90 mb-8">
              <li>1. <a href="#1-introduction" className="text-apricot hover:text-apricot/80">Introduction</a></li>
              <li>2. <a href="#2-information-we-collect" className="text-apricot hover:text-apricot/80">Information We Collect</a></li>
              <li>3. <a href="#3-how-we-use-your-information" className="text-apricot hover:text-apricot/80">How We Use Your Information</a></li>
              <li>4. <a href="#4-legal-bases-for-processing" className="text-apricot hover:text-apricot/80">Legal Bases for Processing</a></li>
              <li>5. <a href="#5-cookies-and-tracking-technologies" className="text-apricot hover:text-apricot/80">Cookies and Tracking Technologies</a></li>
              <li>6. <a href="#6-how-we-share-your-information" className="text-apricot hover:text-apricot/80">How We Share Your Information</a></li>
              <li>7. <a href="#7-data-security" className="text-apricot hover:text-apricot/80">Data Security</a></li>
              <li>8. <a href="#8-data-retention" className="text-apricot hover:text-apricot/80">Data Retention</a></li>
              <li>9. <a href="#9-your-privacy-rights" className="text-apricot hover:text-apricot/80">Your Privacy Rights</a></li>
              <li>10. <a href="#10-international-data-transfers" className="text-apricot hover:text-apricot/80">International Data Transfers</a></li>
              <li>11. <a href="#11-childrens-privacy" className="text-apricot hover:text-apricot/80">Children's Privacy</a></li>
              <li>12. <a href="#12-changes-to-this-privacy-policy" className="text-apricot hover:text-apricot/80">Changes to This Privacy Policy</a></li>
              <li>13. <a href="#13-contact-information" className="text-apricot hover:text-apricot/80">Contact Information</a></li>
              <li>14. <a href="#14-additional-information-for-european-users" className="text-apricot hover:text-apricot/80">Additional Information for European Users</a></li>
              <li>15. <a href="#15-additional-information-for-california-residents" className="text-apricot hover:text-apricot/80">Additional Information for California Residents</a></li>
            </ol>

            <section id="1-introduction">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">1. INTRODUCTION</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Thank you for choosing TuneMyCV. We are committed to protecting your personal data and respecting your privacy rights. This Privacy Policy ("Policy") explains what personal data is collected and how it is processed when you access or use our website, mobile application, and related services (collectively, the "Services").
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                TuneMyCV ("we," "us," or "our") acts as the data controller for the personal data collected through our Services. This Policy applies to all personal data collected through our Services and any related sales, marketing, or events.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Personal data is any information relating to an identified or identifiable natural person. It includes things like email addresses, names, phone numbers, resume content, and payment information.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We hope you take some time to read through this Policy carefully. If there are any terms in this Policy that you do not agree with, please immediately discontinue use of our Services. If you have any questions or concerns about our collection or use of your information, please contact us at <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>.
              </p>
            </section>

            {/* Continue with remaining sections... */}
            <section id="2-information-we-collect">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">2. INFORMATION WE COLLECT</h2>
              
              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">2.1 Information You Provide to Us</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We collect personal data that you provide to us when registering to use our Services, expressing an interest in obtaining information about us or our Services, or otherwise contacting us. The personal data we collect depends on the context of your interactions with us and the choices you make, including:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Account Information</strong>: When you create an account, we collect your name, email address, password, and other account details.</li>
                <li>• <strong>Profile Information</strong>: Information you provide in your user profile, including professional title, industry, and preferences.</li>
                <li>• <strong>Resume/CV Content</strong>: Information you include in your resume or CV, such as employment history, education, skills, achievements, and contact details.</li>
                <li>• <strong>Payment Information</strong>: When you purchase premium services, we collect payment details, billing address, and other financial information necessary to process your payment. All payment data is stored by our third-party payment processors.</li>
                <li>• <strong>Communications</strong>: Information you provide when you contact our customer support, respond to surveys, or communicate with us in any way.</li>
              </ul>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">2.2 Information We Collect Automatically</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                When you use our Services, we may automatically collect certain information about your device and usage patterns, including:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Device Information</strong>: IP address, browser type and version, operating system, device type, and other technical information about your device.</li>
                <li>• <strong>Usage Data</strong>: Information about how you use our Services, including pages visited, features used, time spent on the platform, and other interaction data.</li>
                <li>• <strong>Location Information</strong>: General location information based on IP address.</li>
                <li>• <strong>Log Data</strong>: Server logs, error reports, and activity logs.</li>
              </ul>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">2.3 Information from Third Parties</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                In some cases, we may receive information about you from third parties, such as:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Social Media Platforms</strong>: If you choose to link your social media accounts or use social login features.</li>
                <li>• <strong>Business Partners</strong>: Information shared by our business partners, such as job boards or recruitment platforms, when you use integrated services.</li>
                <li>• <strong>Public Sources</strong>: Publicly available information from professional networks or directories.</li>
              </ul>
            </section>

            <section id="13-contact-information">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">13. CONTACT INFORMATION</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Email: <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>
              </p>
            </section>

            <div className="border-t border-apple-core/20 dark:border-citrus/20 pt-8 mt-8">
              <p className="text-center text-blueberry/60 dark:text-apple-core/70 italic">
                By using our Services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
