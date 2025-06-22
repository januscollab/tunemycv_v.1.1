import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Sparkles } from 'lucide-react';

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-heading font-bold text-blueberry dark:text-citrus">
            <MessageSquare className="h-6 w-6 text-zapier-orange mr-2" />
            Interview Prep Generator
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-zapier-orange animate-pulse" />
                <Clock className="h-6 w-6 text-blueberry dark:text-citrus absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1" />
              </div>
            </div>
            
            <h3 className="text-subheading font-semibold text-blueberry dark:text-citrus mb-2">
              Coming Soon!
            </h3>
            
            <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
              We're working hard to bring you personalized interview preparation notes. 
              This feature will generate tailored questions, company insights, and interview tips 
              based on your analysis and job details.
            </p>
            
            <div className="bg-zapier-orange/10 rounded-lg p-3 mb-4">
              <p className="text-caption text-blueberry dark:text-citrus font-medium">
                Expected features:
              </p>
              <ul className="text-micro text-blueberry/80 dark:text-apple-core/80 mt-2 space-y-1">
                <li>• Company research and profile insights</li>
                <li>• Recent press releases and news</li>
                <li>• Tailored interview questions and answers</li>
                <li>• Tips to get noticed and stand out</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onClose}
            className="bg-zapier-orange hover:bg-zapier-orange/90 text-white px-6"
          >
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewPrepModal;