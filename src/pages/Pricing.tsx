import React, { useState } from 'react';
import { Check, CreditCard, Zap, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MockPaymentModal } from '@/components/ui/mock-payment-modal';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const plans = [
    {
      name: '10 Credits',
      price: 10,
      credits: 10,
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
      name: '30 Credits',
      price: 25,
      credits: 30,
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
      name: '100 Credits',
      price: 50,
      credits: 100,
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

  const handleBuyCredits = (plan: any) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

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
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-16">
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
                <CardTitle className="text-4xl font-bold text-zapier-orange mb-4">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-earth dark:text-white">${plan.price}</span>
                  </div>
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
                  onClick={() => handleBuyCredits(plan)}
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

        {/* How are Credits Spent Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-earth dark:text-white mb-4">
              How are Credits Spent?
            </h2>
            <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mx-auto">
              Each service consumes a specific number of credits. Here's our detailed breakdown:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-earth dark:text-white mb-2">CV Analysis</h3>
                <div className="text-3xl font-bold text-zapier-orange mb-2">2 Credits</div>
                <p className="text-earth/70 dark:text-white/70 text-sm">
                  Comprehensive CV analysis against a specific job role including ATS optimization, 
                  skills gap analysis, keyword matching, and personalized recommendations for improvement.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-earth dark:text-white mb-2">Cover Letter</h3>
                <div className="text-3xl font-bold text-zapier-orange mb-2">1 Credit</div>
                <p className="text-earth/70 dark:text-white/70 text-sm">
                  AI-generated, personalized cover letter tailored to the specific job role and your CV, 
                  with professional formatting and compelling content that highlights your strengths.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-earth dark:text-white mb-2">Interview Prep Pack</h3>
                <div className="text-3xl font-bold text-zapier-orange mb-2">3 Credits</div>
                <p className="text-earth/70 dark:text-white/70 text-sm">
                  Complete interview preparation including role-specific questions, STAR method examples, 
                  company research insights, and personalized talking points based on your experience.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-zapier-orange/10 to-apricot/10 dark:from-zapier-orange/5 dark:to-apricot/5 rounded-xl p-6 border border-zapier-orange/20">
            <h3 className="text-xl font-semibold text-earth dark:text-white mb-3 text-center">
              Complete Job Application Package
            </h3>
            <div className="text-center">
              <p className="text-earth/70 dark:text-white/70 mb-4">
                For a complete application to one role, you'll typically use:
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-zapier-orange rounded-full mr-2"></div>
                  <span className="text-earth/80 dark:text-white/80">CV Analysis (2 credits)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-zapier-orange rounded-full mr-2"></div>
                  <span className="text-earth/80 dark:text-white/80">Cover Letter (1 credit)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-zapier-orange rounded-full mr-2"></div>
                  <span className="text-earth/80 dark:text-white/80">Interview Prep (3 credits)</span>
                </div>
              </div>
              <div className="mt-4 text-lg font-semibold text-zapier-orange">
                Total: 6 credits per complete application
              </div>
            </div>
          </div>
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

        {/* Mock Payment Modal */}
        {selectedPlan && (
          <MockPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            plan={selectedPlan}
          />
        )}
      </div>
    </div>
  );
};

export default Pricing;