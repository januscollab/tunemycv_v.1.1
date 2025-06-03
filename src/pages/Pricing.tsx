
import React from 'react';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">
            Pricing Plans
          </h1>
          <p className="text-lg text-blueberry/70 dark:text-apple-core/80">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">Free</h3>
            <p className="text-3xl font-bold text-zapier-orange mb-4">$0<span className="text-sm text-gray-500">/month</span></p>
            <ul className="space-y-2 text-blueberry/70 dark:text-apple-core/80">
              <li>• 3 CV analyses per month</li>
              <li>• Basic feedback</li>
              <li>• Email support</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-6 border-2 border-zapier-orange">
            <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">Pro</h3>
            <p className="text-3xl font-bold text-zapier-orange mb-4">$19<span className="text-sm text-gray-500">/month</span></p>
            <ul className="space-y-2 text-blueberry/70 dark:text-apple-core/80">
              <li>• Unlimited CV analyses</li>
              <li>• Advanced AI feedback</li>
              <li>• Cover letter generation</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-blueberry/90 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">Enterprise</h3>
            <p className="text-3xl font-bold text-zapier-orange mb-4">Custom</p>
            <ul className="space-y-2 text-blueberry/70 dark:text-apple-core/80">
              <li>• Everything in Pro</li>
              <li>• Team management</li>
              <li>• Custom integrations</li>
              <li>• Dedicated support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
