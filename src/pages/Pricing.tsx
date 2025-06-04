import React from 'react';
import { Check, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Pricing = () => {
  const plans = [
    {
      name: 'FREE',
      price: 0,
      credits: 10,
      period: 'credits',
      description: '10 FREE credits, valid for 7 days',
      costPerCredit: null,
      savings: null,
      features: [
        '2 CV analyses against role',
        '2 Cover letters generated',
        '1 Interview prep pack',
        'Apply for up to 2 roles, absolutely free'
      ],
      restrictions: [
        'ZERO restrictions to functionality while using available credits',
        'Valid for 14 days from signing up'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'USD 10',
      price: 10,
      credits: 10,
      period: 'credits',
      description: '10 credits',
      costPerCredit: '~$1.00 per credit',
      savings: null,
      features: [
        '2 CV analyses against role',
        '2 Cover letters generated',
        '1 Interview prep pack',
        'Apply for 2 roles'
      ],
      restrictions: [
        'No restrictions while using available credits',
        'Valid for 30 days from purchase'
      ],
      buttonText: 'Buy 10 Credits',
      popular: false
    },
    {
      name: 'USD 25',
      price: 25,
      credits: 30,
      period: 'credits',
      description: '30 credits',
      costPerCredit: '~$0.83 per credit',
      savings: '17% Saving',
      features: [
        '8 CV analyses against role',
        '8 Cover letters generated',
        '2 Interview prep packs',
        'Apply for 8 roles'
      ],
      restrictions: [
        'No restrictions while using available credits',
        'Valid for 90 days from purchase'
      ],
      buttonText: 'Buy 30 Credits',
      popular: true
    },
    {
      name: 'USD 50',
      price: 50,
      credits: 100,
      period: 'credits',
      description: '100 credits',
      costPerCredit: '~$0.50 per credit',
      savings: '50% Saving',
      features: [
        '25 CV analyses against role',
        '25 Cover letters generated',
        '8 Interview prep packs',
        'Apply for 25 roles'
      ],
      restrictions: [
        'No restrictions while using available credits',
        'Valid for 1 year from purchase'
      ],
      buttonText: 'Buy 100 Credits',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-6">
      <div className="max-w-wider mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-start mb-6">
            <CreditCard className="h-8 w-8 text-zapier-orange mr-3 flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-earth dark:text-white">
                Choose Your <span className="text-zapier-orange">Tune</span>MyCV Credits
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-2">
                Buy credits to unlock AI-powered CV analysis, cover letter generation, and interview preparation tools. No subscriptions, pay as you go.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-zapier-orange shadow-lg scale-105' 
                  : 'border border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50'
              } bg-white dark:bg-blueberry/20`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-zapier-orange text-white px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-earth dark:text-white mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  {plan.price === 0 ? (
                    <div className="text-4xl font-bold text-zapier-orange">FREE</div>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-zapier-orange">${plan.price}</span>
                      <span className="text-lg text-earth/70 dark:text-white/70 ml-2">
                        for {plan.credits} credits
                      </span>
                    </div>
                  )}
                  {plan.costPerCredit && (
                    <div className="text-sm text-earth/60 dark:text-white/60 mt-1">
                      {plan.costPerCredit}
                    </div>
                  )}
                  {plan.savings && (
                    <Badge className="bg-green-100 text-green-800 mt-2">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
                <p className="text-earth/70 dark:text-white/70">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-earth dark:text-white mb-2">What you get:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center mb-2">
                        <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm text-earth/80 dark:text-white/90">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-earth dark:text-white mb-2">Terms:</h4>
                    {plan.restrictions.map((restriction, restrictionIndex) => (
                      <div key={restrictionIndex} className="flex items-start mb-1">
                        <div className="w-1 h-1 bg-earth/40 dark:bg-white/40 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span className="text-xs text-earth/60 dark:text-white/60">
                          {restriction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full py-3 font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-zapier-orange hover:bg-zapier-orange/90 text-white'
                      : 'bg-apricot hover:bg-apricot/90 text-white'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-earth dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  How do credits work?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Each credit gives you access to one CV analysis, cover letter generation, or interview prep pack. Buy only what you need, when you need it.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  Do credits expire?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Yes, credits have validity periods ranging from 14 days (free) to 1 year (100 credits pack). Check each plan for specific terms.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  We accept all major credit cards, PayPal, and secure online payment methods for credit purchases.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  Can I get a refund on unused credits?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Yes, we offer refunds on unused credits within 30 days of purchase, subject to our refund policy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center bg-white dark:bg-blueberry/20 rounded-xl p-8 border border-apple-core/20 dark:border-citrus/20">
          <h3 className="text-xl font-semibold text-earth dark:text-white mb-4">
            Trusted by thousands of professionals
          </h3>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-sm font-medium text-earth/70 dark:text-white/70">
              10,000+ CVs analyzed
            </div>
            <div className="w-px h-6 bg-apple-core/30 dark:bg-citrus/30"></div>
            <div className="text-sm font-medium text-earth/70 dark:text-white/70">
              98% satisfaction rate
            </div>
            <div className="w-px h-6 bg-apple-core/30 dark:bg-citrus/30"></div>
            <div className="text-sm font-medium text-earth/70 dark:text-white/70">
              SOC 2 compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;