
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
            <h1 className="text-3xl font-bold text-blueberry dark:text-citrus mb-8">PRIVACY POLICY</h1>
            
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

            <section id="3-how-we-use-your-information">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We use your personal data for various purposes, including:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Providing our Services</strong>: To create and manage your account, deliver our core CV optimization services, process transactions, and fulfill our contractual obligations to you.</li>
                <li>• <strong>Improving our Services</strong>: To analyze usage patterns, troubleshoot technical issues, and enhance the functionality and user experience of our platform.</li>
                <li>• <strong>Personalization</strong>: To tailor our Services to your preferences and provide personalized recommendations and content.</li>
                <li>• <strong>Communication</strong>: To respond to your inquiries, send service-related announcements, and provide customer support.</li>
                <li>• <strong>Marketing</strong>: With your consent, to send you promotional communications about our Services, special offers, and events. You can opt out of these communications at any time.</li>
                <li>• <strong>Analytics</strong>: To gather statistical information about the use of our Services, monitor performance, and optimize our platform.</li>
                <li>• <strong>Legal Compliance</strong>: To comply with applicable legal requirements, industry standards, and our policies.</li>
                <li>• <strong>Security</strong>: To detect, prevent, and address technical issues, fraud, and other harmful activities.</li>
              </ul>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">3.1 AI and Machine Learning</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We use artificial intelligence and machine learning technologies to provide and improve our CV optimization services. This includes:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• Analyzing resume content to provide tailored improvement suggestions</li>
                <li>• Matching resume content with job descriptions to optimize compatibility</li>
                <li>• Generating recommendations for skills, keywords, and formatting improvements</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                These processes are automated and designed to enhance your resume's effectiveness. The AI systems may use anonymized or aggregated data for training and improvement purposes.
              </p>
            </section>

            <section id="4-legal-bases-for-processing">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">4. LEGAL BASES FOR PROCESSING</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We process your personal data only when we have a valid legal basis to do so. Depending on the specific processing activity, we rely on one or more of the following legal bases:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Contractual Necessity</strong>: Processing necessary for the performance of our contract with you to provide the Services.</li>
                <li>• <strong>Legitimate Interests</strong>: Processing necessary for our legitimate interests, provided these interests are not overridden by your rights and freedoms. Our legitimate interests include providing, improving, and securing our Services, preventing fraud, and marketing our Services.</li>
                <li>• <strong>Consent</strong>: Processing based on your specific consent, which you can withdraw at any time.</li>
                <li>• <strong>Legal Obligation</strong>: Processing necessary to comply with our legal obligations.</li>
              </ul>
            </section>

            <section id="5-cookies-and-tracking-technologies">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">5. COOKIES AND TRACKING TECHNOLOGIES</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We use cookies and similar tracking technologies to collect information about your browsing activities on our Services. Cookies are small text files stored on your device that help us provide and improve our Services.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We use the following types of cookies:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Essential Cookies</strong>: Necessary for the functioning of our Services.</li>
                <li>• <strong>Analytical/Performance Cookies</strong>: Help us understand how visitors interact with our Services.</li>
                <li>• <strong>Functionality Cookies</strong>: Allow us to remember choices you make and provide enhanced features.</li>
                <li>• <strong>Targeting Cookies</strong>: Record your visit to our Services, the pages you visit, and the links you follow.</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                You can control cookies through your browser settings and other tools. However, if you block certain cookies, you may not be able to use all the features of our Services.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                For more detailed information about the cookies we use, please refer to our Cookie Policy.
              </p>
            </section>

            <section id="6-how-we-share-your-information">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">6. HOW WE SHARE YOUR INFORMATION</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We may share your personal data with the following categories of recipients:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Service Providers</strong>: Third-party vendors who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.</li>
                <li>• <strong>Business Partners</strong>: Companies we partner with to offer integrated services, such as job boards or recruitment platforms, when you choose to use these integrated features.</li>
                <li>• <strong>Affiliates</strong>: Our subsidiaries and affiliated companies, who may help us provide and improve our Services.</li>
                <li>• <strong>Legal Authorities</strong>: When required by law, court order, or governmental regulation.</li>
                <li>• <strong>Business Transfers</strong>: In connection with a corporate transaction, such as a merger, acquisition, or sale of assets.</li>
                <li>• <strong>With Your Consent</strong>: In other cases where we have your explicit consent to share your information.</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.
              </p>
            </section>

            <section id="7-data-security">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">7. DATA SECURITY</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. We regularly review and update these measures to maintain a level of security appropriate to the risk.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                In the event of a personal data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and the relevant supervisory authority without undue delay, in accordance with applicable law.
              </p>
            </section>

            <section id="8-data-retention">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">8. DATA RETENTION</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                To determine the appropriate retention period for personal data, we consider:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• The amount, nature, and sensitivity of the personal data</li>
                <li>• The potential risk of harm from unauthorized use or disclosure</li>
                <li>• The purposes for which we process the data</li>
                <li>• Whether we can achieve those purposes through other means</li>
                <li>• Applicable legal requirements</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                In some circumstances, we may anonymize your personal data so that it can no longer be associated with you, in which case we may use such information without further notice to you.
              </p>
            </section>

            <section id="9-your-privacy-rights">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">9. YOUR PRIVACY RIGHTS</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• <strong>Right to Access</strong>: The right to request a copy of the personal data we hold about you.</li>
                <li>• <strong>Right to Rectification</strong>: The right to request correction of inaccurate personal data or completion of incomplete personal data.</li>
                <li>• <strong>Right to Erasure</strong>: The right to request deletion of your personal data in certain circumstances.</li>
                <li>• <strong>Right to Restrict Processing</strong>: The right to request restriction of processing of your personal data in certain circumstances.</li>
                <li>• <strong>Right to Data Portability</strong>: The right to receive your personal data in a structured, commonly used, and machine-readable format.</li>
                <li>• <strong>Right to Object</strong>: The right to object to processing of your personal data in certain circumstances.</li>
                <li>• <strong>Right to Withdraw Consent</strong>: The right to withdraw consent at any time where we rely on consent to process your personal data.</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                To exercise any of these rights, please contact us at <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>. We will respond to your request within the timeframe required by applicable law.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Please note that these rights may be subject to certain limitations and exceptions under applicable law.
              </p>
            </section>

            <section id="10-international-data-transfers">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">10. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We may transfer your personal data to countries outside your country of residence, including to countries that may not provide the same level of data protection as your country.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                When we transfer personal data internationally, we implement appropriate safeguards in accordance with applicable law, which may include:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• Standard contractual clauses approved by relevant data protection authorities</li>
                <li>• Binding corporate rules</li>
                <li>• Other valid transfer mechanisms</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                By using our Services, you acknowledge that your personal data may be transferred to countries outside your country of residence.
              </p>
            </section>

            <section id="11-childrens-privacy">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">11. CHILDREN'S PRIVACY</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                Our Services are not directed to individuals under the age of 16, and we do not knowingly collect personal data from children. If we learn that we have collected personal data from a child, we will take steps to delete that information as soon as possible.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                If you believe that we might have any information from or about a child, please contact us at <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>.
              </p>
            </section>

            <section id="12-changes-to-this-privacy-policy">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">12. CHANGES TO THIS PRIVACY POLICY</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Last Updated" date at the top of this Privacy Policy.
              </p>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of our Services after any changes to this Privacy Policy constitutes your acceptance of the changes.
              </p>
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

            <section id="14-additional-information-for-european-users">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">14. ADDITIONAL INFORMATION FOR EUROPEAN USERS</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, the following additional information applies:
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">14.1 Data Controller</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                TuneMyCV is the data controller responsible for your personal data.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">14.2 Data Protection Officer</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                You can contact our Data Protection Officer at <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a>.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">14.3 Supervisory Authority</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                You have the right to lodge a complaint with a supervisory authority in your country of residence, place of work, or place of an alleged infringement of applicable data protection law.
              </p>
            </section>

            <section id="15-additional-information-for-california-residents">
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mt-8 mb-4">15. ADDITIONAL INFORMATION FOR CALIFORNIA RESIDENTS</h2>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA) provides you with specific rights regarding your personal information.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.1 Categories of Personal Information Collected</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                In the past 12 months, we have collected the categories of personal information described in Section 2 of this Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.2 Sources of Personal Information</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We collect personal information directly from you, automatically through your use of our Services, and from third parties as described in Section 2.3.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.3 Business or Commercial Purpose for Collecting Personal Information</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We collect personal information for the purposes described in Section 3 of this Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.4 Categories of Third Parties with Whom We Share Personal Information</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We share personal information with the categories of third parties described in Section 6 of this Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.5 Sale or Sharing of Personal Information</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                We do not sell your personal information as defined by the CCPA/CPRA. We may share your personal information with third parties for business purposes as described in this Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mt-6 mb-3">15.6 California Privacy Rights</h3>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                As a California resident, you have the following rights:
              </p>
              <ul className="space-y-2 text-blueberry/80 dark:text-apple-core/90 mb-4">
                <li>• Right to know about personal information collected, disclosed, or sold</li>
                <li>• Right to delete personal information</li>
                <li>• Right to correct inaccurate personal information</li>
                <li>• Right to opt-out of the sale or sharing of personal information</li>
                <li>• Right to limit use and disclosure of sensitive personal information</li>
                <li>• Right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="text-blueberry/80 dark:text-apple-core/90 mb-4">
                To exercise these rights, please contact us at <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">hello@tunemycv.com</a> or through the methods described in Section 13.
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
