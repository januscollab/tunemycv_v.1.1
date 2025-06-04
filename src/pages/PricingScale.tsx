import React, { useState } from 'react';
import { Check, CreditCard, Zap, FileText, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { MockPaymentModal } from '@/components/ui/mock-payment-modal';
import { ContactSalesModal } from '@/components/ui/contact-sales-modal';

const PricingScale = () => {
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const pricingTiers = [
    {
      credits: 15,
      price: 15,
      savings: null,
      roles: 3,
      name: '15 Credits'
    },
    {
      credits: 30,
      price: 25,
      savings: '17% Saving',
      roles: 7,
      name: '30 Credits'
    },
    {
      credits: 65,
      price: 50,
      savings: '23% Saving',
      roles: 16,
      name: '65 Credits'
    },
    {
      credits: 100,
      price: 75,
      savings: '25% Saving',
      roles: 25,
      name: '100 Credits'
    },
    {
      credits: null,
      price: null,
      savings: null,
      roles: null,
      name: 'Enterprise',
      isEnterprise: true
    }
  ];

  const currentTier = pricingTiers[selectedTier];

  const handleSliderChange = (value: number[]) => {
    setSelectedTier(value[0]);
  };

  const handleBuyCredits = () => {
    if (currentTier.isEnterprise) {
      setIsContactModalOpen(true);
    } else {
      setSelectedPlan({
        name: currentTier.name,
        price: currentTier.price,
        credits: currentTier.credits
      });
      setIsPaymentModalOpen(true);
    }
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

        {/* Pricing Slider */}
        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20 p-8">
            <CardContent className="space-y-8">
              {/* Tier Labels */}
              <div className="flex justify-between items-center text-sm font-medium text-earth/70 dark:text-white/70">
                {pricingTiers.map((tier, index) => (
                  <div key={index} className="text-center">
                    {tier.isEnterprise ? (
                      <span className="text-zapier-orange font-semibold">Enterprise</span>
                    ) : (
                      <span>{tier.credits} credits</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={[selectedTier]}
                  onValueChange={handleSliderChange}
                  max={4}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Selected Tier Display */}
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-4xl font-bold text-zapier-orange mb-2">
                    {currentTier.isEnterprise ? 'Enterprise' : `${currentTier.credits} Credits`}
                  </h3>
                  {!currentTier.isEnterprise && (
                    <div className="text-3xl font-bold text-earth dark:text-white mb-2">
                      ${currentTier.price}
                    </div>
                  )}
                  {currentTier.savings && (
                    <Badge className="bg-green-100 text-green-800 mb-2">
                      {currentTier.savings}
                    </Badge>
                  )}
                  <div className="text-lg text-earth/70 dark:text-white/70">
                    {currentTier.isEnterprise ? 'Contact Our Team' : `Apply for ${currentTier.roles} Roles`}
                  </div>
                </div>

                <Button 
                  onClick={handleBuyCredits}
                  className="bg-zapier-orange hover:bg-zapier-orange/90 text-white px-8 py-3 text-lg font-semibold"
                >
                  {currentTier.isEnterprise ? 'Contact Sales' : 'Buy Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Modals */}
        {selectedPlan && (
          <MockPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            plan={selectedPlan}
          />
        )}

        <ContactSalesModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default PricingScale;