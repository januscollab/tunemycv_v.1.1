import React from 'react';
import { CheckCircle, Zap, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeCreditsModal: React.FC<WelcomeCreditsModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Welcome to TuneMyCV!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <Zap className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-earth dark:text-white mb-2">
              You've Got 15 Free Credits!
            </h3>
            <p className="text-earth/70 dark:text-white/70 mb-4">
              Your account has been set up with 15 free credits to get you started on your job search journey.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-zapier-orange">
                15 Credits
              </div>
              <div className="text-sm text-earth/60 dark:text-white/60">
                Ready to use
              </div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="font-semibold text-earth dark:text-white text-center">What can you do with your credits?</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-earth/80 dark:text-white/80">CV Analysis</span>
                <span className="text-zapier-orange font-medium">2 Credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth/80 dark:text-white/80">Cover Letter</span>
                <span className="text-zapier-orange font-medium">1 Credit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth/80 dark:text-white/80">Interview Prep</span>
                <span className="text-zapier-orange font-medium">2 Credits</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-zapier-orange hover:bg-zapier-orange/90"
          >
            Start Using Your Credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};