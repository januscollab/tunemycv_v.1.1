import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    credits: number;
  };
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  const [step, setStep] = useState<'payment' | 'success'>('payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const { user } = useAuth();
  const { profileData, loading } = useProfileData();
  const { toast } = useToast();

  // Auto-populate form fields when modal opens or profile data loads
  useEffect(() => {
    if (isOpen && profileData && !loading) {
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setEmail(profileData.email || user?.email || '');
    }
  }, [isOpen, profileData, loading, user]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Update profile with name if it's missing and user provided it
      if (user && (firstName || lastName) && 
          (!profileData?.first_name || !profileData?.last_name)) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName || profileData?.first_name,
            last_name: lastName || profileData?.last_name,
            email: email || user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating profile:', error);
          toast({
            title: 'Profile Update Failed',
            description: 'Payment processed but profile update failed.',
            variant: 'destructive'
          });
        }
      }
      
      // Simulate payment processing (like Stripe would do)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add credits to user account after successful "payment"
      if (user && plan.credits) {
        // First get current credits
        const { data: currentCredits, error: fetchError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching current credits:', fetchError);
          toast({
            title: 'Credits Update Failed',
            description: 'Could not retrieve current credit balance. Please contact support.',
            variant: 'destructive'
          });
          return;
        }
        
        const newCreditsTotal = (currentCredits?.credits || 0) + plan.credits;
        
        // Update with new total
        const { error: creditsError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: user.id,
            credits: newCreditsTotal,
            updated_at: new Date().toISOString()
          });
        
        if (creditsError) {
          console.error('Error updating credits:', creditsError);
          toast({
            title: 'Credits Update Failed',
            description: 'Payment processed but credits could not be added. Please contact support.',
            variant: 'destructive'
          });
          return;
        }
      }
      
      setStep('success');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('payment');
    setFirstName('');
    setLastName('');
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'payment' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zapier-orange" />
                Purchase {plan.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Test Mode Banner */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  🧪 Test Mode - No real payment will be processed
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-earth dark:text-white mb-2">Order Summary</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-earth/70 dark:text-white/70">{plan.credits} Credits</span>
                  <span className="font-semibold text-earth dark:text-white">${plan.price}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-earth dark:text-white">Total</span>
                    <span className="font-bold text-zapier-orange text-lg">${plan.price}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <FloatingLabelInput
                      id="firstName"
                      label="First Name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <FloatingLabelInput
                      id="lastName"
                      label="Last Name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <FloatingLabelInput
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <FloatingLabelInput
                    id="cardNumber"
                    label="Card Number"
                    placeholder="4242 4242 4242 4242"
                    value="4242 4242 4242 4242"
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <FloatingLabelInput
                      id="expiry"
                      label="Expiry"
                      placeholder="12/28"
                      value="12/28"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <FloatingLabelInput
                      id="cvc"
                      label="CVC"
                      placeholder="123"
                      value="123"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-1 bg-zapier-orange hover:bg-zapier-orange/90"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay $${plan.price}`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Payment Successful!
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-earth dark:text-white mb-2">
                  Credits Added Successfully!
                </h3>
                <p className="text-earth/70 dark:text-white/70 mb-4">
                  {plan.credits} credits have been added to your account
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-zapier-orange">
                    {plan.credits} Credits
                  </div>
                  <div className="text-sm text-earth/60 dark:text-white/60">
                    Ready to use
                  </div>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-zapier-orange hover:bg-zapier-orange/90"
              >
                Start Using Credits
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};