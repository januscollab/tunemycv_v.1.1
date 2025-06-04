import React, { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('success');
    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('payment');
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

              {/* Mock Payment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value="4242 4242 4242 4242"
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="12/28"
                      value="12/28"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value="123"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                  />
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