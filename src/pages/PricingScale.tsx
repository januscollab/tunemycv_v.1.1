import React, { useState } from 'react';
import { Check, CreditCard, Zap, FileText, Users, ArrowRight, Brain } from 'lucide-react';
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
          <Card className="bg-white dark:bg-blueberry/20 border-2 border-zapier-orange/50 dark:border-zapier-orange/60 p-8 shadow-xl shadow-zapier-orange/20">
            <CardHeader className="pb-6 pt-2">
              <CardTitle className="text-2xl font-bold text-earth dark:text-white text-left">
                Simple Pay As you go Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={[selectedTier]}
                  onValueChange={handleSliderChange}
                  max={4}
                  min={0}
                  step={1}
                  className="w-full [&>*:first-child]:bg-gray-200 dark:[&>*:first-child]:bg-gray-700 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&>*:first-child]:h-0.5"
                />
              </div>

              {/* Tier Labels Below Slider - Grid Layout for Perfect Alignment */}
              <div className="px-2">
                <div className="grid grid-cols-5 gap-0">
                  {pricingTiers.map((tier, index) => (
                    <div key={index} className="text-center">
                      {tier.isEnterprise ? (
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-earth dark:text-white">Enterprise</div>
                          <div className="text-sm text-earth/70 dark:text-white/70">Let's talk</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-earth dark:text-white">${tier.price}</div>
                          <div className="text-sm text-earth/70 dark:text-white/70">{tier.credits} Credits</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Tier Display */}
              <div className="text-left space-y-6">
                <div className="space-y-3">
                  {currentTier.isEnterprise ? (
                    <>
                      <h3 className="text-4xl text-zapier-orange mb-2">
                        Enterprise
                      </h3>
                      <div className="text-lg text-earth/70 dark:text-white/70">
                        Let's talk
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl text-zapier-orange font-bold">${currentTier.price}</span>
                        <span className="text-xl text-earth dark:text-white">for</span>
                        <span className="text-xl text-zapier-orange font-bold">{currentTier.credits} Credits</span>
                        {currentTier.savings && (
                          <Badge className="bg-green-100 text-green-800 ml-3 px-4 py-1.5 text-sm">
                            {currentTier.savings}
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg font-medium text-earth/80 dark:text-white/80">
                        Apply for {currentTier.roles} Roles
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={handleBuyCredits}
                  variant="outline"
                  className="border-2 border-zapier-orange bg-white hover:bg-zapier-orange/5 text-zapier-orange hover:text-zapier-orange px-8 py-3 text-lg font-normal transition-all duration-200 hover:shadow-lg hover:shadow-zapier-orange/20"
                >
                  {currentTier.isEnterprise ? 'Contact Sales' : 'Buy Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* End-to-End Journey Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-earth dark:text-white mb-4">
              Your Complete Job Application Journey
            </h2>
            <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mx-auto">
              Transform your job search with our comprehensive AI-powered process
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Flow Line */}
              <div className="hidden md:block absolute top-1/2 left-16 right-16 h-0.5 bg-gradient-to-r from-zapier-orange via-citrus to-zapier-orange transform -translate-y-1/2"></div>
              
              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Step 1: CV Analysis */}
                <div className="text-center group">
                  <div className="bg-white dark:bg-blueberry/20 border-2 border-zapier-orange/30 dark:border-zapier-orange/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-zapier-orange to-apricot rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-earth dark:text-white mb-2">1. CV Analysis</h3>
                    <div className="text-2xl font-bold text-zapier-orange mb-3">2 Credits</div>
                    <p className="text-earth/70 dark:text-white/70 text-sm mb-4">
                      Get AI-powered insights on your CV's strengths, weaknesses, and ATS optimization opportunities.
                    </p>
                    <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 rounded-lg p-3">
                      <p className="text-xs text-earth/80 dark:text-white/80 font-medium">
                        ✓ Role Suitability<br />
                        ✓ Skills Gap Analysis<br />
                        ✓ Keyword Matching
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Cover Letter */}
                <div className="text-center group">
                  <div className="bg-white dark:bg-blueberry/20 border-2 border-blue-500/30 dark:border-blue-500/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-earth dark:text-white mb-2">2. Cover Letter</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-3">1 Credit</div>
                    <p className="text-earth/70 dark:text-white/70 text-sm mb-4">
                      Generate a personalized, compelling cover letter tailored to the specific role and company.
                    </p>
                    <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-earth/80 dark:text-white/80 font-medium">
                        ✓ Role-Specific Content<br />
                        ✓ Professional Formatting<br />
                        ✓ Compelling Narrative
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Interview Prep */}
                <div className="text-center group">
                  <div className="bg-white dark:bg-blueberry/20 border-2 border-green-500/30 dark:border-green-500/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-earth dark:text-white mb-2">3. Interview Prep</h3>
                    <div className="text-2xl font-bold text-green-600 mb-3">2 Credits</div>
                    <p className="text-earth/70 dark:text-white/70 text-sm mb-4">
                      Master your interview with role-specific questions, STAR examples, and company insights.
                    </p>
                    <div className="bg-green-100/50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-earth/80 dark:text-white/80 font-medium">
                        ✓ Tailored Questions<br />
                        ✓ STAR Method Examples<br />
                        ✓ Company Research
                      </p>
                    </div>
                  </div>
                </div>
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
        <div className="bg-gradient-to-br from-white via-zapier-orange/5 to-apricot/5 dark:from-blueberry/20 dark:via-zapier-orange/10 dark:to-apricot/10 rounded-2xl p-8 border border-zapier-orange/20 dark:border-citrus/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-earth dark:text-white mb-2">
              Trusted by thousands of professionals
            </h3>
            <p className="text-earth/60 dark:text-white/60">
              Join our community of successful job seekers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-zapier-orange/20 to-apricot/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-8 w-8 text-zapier-orange" />
              </div>
              <div className="text-2xl font-bold text-zapier-orange mb-1">10,000+</div>
              <div className="text-sm font-medium text-earth/70 dark:text-white/70">CVs analyzed</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">92%</div>
              <div className="text-sm font-medium text-earth/70 dark:text-white/70">satisfaction rate</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-600 mb-1">SOC 2</div>
              <div className="text-sm font-medium text-earth/70 dark:text-white/70">compliant</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-600 mb-1">Trained AI</div>
              <div className="text-sm font-medium text-earth/70 dark:text-white/70">Modelling</div>
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