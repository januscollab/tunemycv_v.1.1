import React from 'react';
import { Check, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 CV analyses per month',
        'Basic AI feedback',
        'Cover letter generation',
        'Interview prep basics',
        'Email support'
      ],
      limitations: [
        'Limited analysis depth',
        'No priority support'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: 29,
      period: 'month',
      description: 'For serious job seekers',
      features: [
        'Unlimited CV analyses',
        'Advanced AI insights',
        'Unlimited cover letters',
        'Advanced interview prep',
        'ATS optimization',
        'Priority email support',
        'Industry-specific templates',
        'Skills gap analysis'
      ],
      limitations: [],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: null,
      period: 'custom',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        'Bulk CV processing',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
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
                Choose Your <span className="text-zapier-orange">Tune</span>MyCV Plan
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-2">
                Unlock your career potential with AI-powered CV analysis, cover letter generation, and interview preparation tools.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
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
                  {plan.price !== null ? (
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-zapier-orange">${plan.price}</span>
                      <span className="text-lg text-earth/70 dark:text-white/70 ml-2">
                        /{plan.period}
                      </span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-zapier-orange">Custom</div>
                  )}
                </div>
                <p className="text-earth/70 dark:text-white/70">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-earth/80 dark:text-white/90">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center opacity-50">
                      <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-earth/60 dark:text-white/60 line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
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
                  Can I change plans anytime?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Yes! The Free plan gives you access to core features forever, and Pro includes a 7-day free trial.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-earth dark:text-white mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Yes, we offer a 30-day money-back guarantee for all paid plans.
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