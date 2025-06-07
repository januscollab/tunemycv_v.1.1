import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Lightbulb, Bug, Heart, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { UnifiedInput, UnifiedTextarea } from '@/components/ui/unified-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FloatingFeedbackFormProps {
  onClose: () => void;
  currentPage?: string;
  prefilledData?: {
    category?: string;
    subject?: string;
    message?: string;
  };
}

const feedbackCategories = [
  { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-yellow-500' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-500' },
  { id: 'appreciation', label: 'Appreciation', icon: Heart, color: 'bg-pink-500' },
  { id: 'performance', label: 'Performance', icon: Zap, color: 'bg-green-500' },
  { id: 'ai-query', label: 'AI Query', icon: Brain, color: 'bg-purple-500' },
];

export const FloatingFeedbackForm: React.FC<FloatingFeedbackFormProps> = ({ 
  onClose, 
  currentPage = 'homepage',
  prefilledData 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowContact, setAllowContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(prefilledData?.category || 'general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: prefilledData?.subject || '',
    message: prefilledData?.message || ''
  });
  const [characterCount, setCharacterCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const maxCharacters = 1000;

  useEffect(() => {
    // Auto-focus first input after animation
    const timer = setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input');
      firstInput?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const getContextualMessage = () => {
    const messages = {
      homepage: "Help us improve your experience!",
      analyze: "How was your CV analysis experience? Any suggestions for improvement?",
      resources: "Found our resources helpful? Let us know what else you'd like to see!",
      profile: "How can we improve your profile and dashboard experience?",
      default: "Your feedback helps us build better tools for job seekers like you!"
    };
    return messages[currentPage as keyof typeof messages] || messages.default;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'message') {
      setCharacterCount(value.length);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = feedbackCategories.find(c => c.id === categoryId);
    if (category && !prefilledData?.subject) {
      setFormData(prev => ({ ...prev, subject: category.label }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: selectedCategory,
          currentPage,
          allowContact
        }
      });

      if (error) throw error;

      setShowSuccess(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAllowContact(false);
        setCharacterCount(0);
      }, 2500);

    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: 'Please try again or email us at hello@tunemycv.com',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-earth dark:text-white mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-earth/70 dark:text-white/70">
            Your feedback has been sent successfully. We truly appreciate you helping us improve TuneMyCV!
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            This window will close automatically...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Category Selection */}
      <div className="mb-6">
        <Label className="mb-3">What type of feedback is this?</Label>
        <div className="grid grid-cols-2 gap-2">
          {feedbackCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  p-3 rounded-lg border transition-all duration-200 text-left
                  hover:shadow-md group
                  ${selectedCategory === category.id 
                    ? 'border-zapier-orange bg-zapier-orange/10' 
                    : 'border-border hover:border-zapier-orange/50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full ${category.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium group-hover:text-zapier-orange transition-colors">
                    {category.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Form Fields */}
      <div className="space-y-4 flex-1">
        <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 border border-zapier-orange/20 rounded-lg p-3 mb-6">
          <p className="text-sm text-earth dark:text-white">
            {getContextualMessage()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <UnifiedInput
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name (optional)"
              disabled={isSubmitting}
              maxLength={100}
              secure={true}
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <UnifiedInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder={allowContact ? "your@email.com (required)" : "your@email.com (optional)"}
              required={allowContact}
              disabled={isSubmitting}
              maxLength={100}
              secure={true}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <UnifiedInput
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter subject"
            required
            disabled={isSubmitting}
            maxLength={200}
            secure={true}
          />
        </div>

        <div>
          <Label htmlFor="message">Your Feedback</Label>
          <UnifiedTextarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Please share your feedback, ideas, or issues..."
            className="min-h-[100px]"
            required
            disabled={isSubmitting}
            maxLength={maxCharacters}
            secure={true}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-muted-foreground">
              Share your thoughts, ideas, or issues...
            </div>
            <div className={`text-xs transition-colors ${
              characterCount > maxCharacters * 0.9 
                ? 'text-red-500' 
                : 'text-muted-foreground'
            }`}>
              {characterCount}/{maxCharacters}
            </div>
          </div>
        </div>

        {/* Contact Permission */}
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
          <Checkbox
            id="allowContact"
            checked={allowContact}
            onCheckedChange={(checked) => setAllowContact(checked as boolean)}
            disabled={isSubmitting}
            className="mt-0.5"
          />
          <label 
            htmlFor="allowContact" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Yes, you can contact me about my feedback
            <span className="text-xs text-muted-foreground block mt-1">
              We'll only reach out if we need clarification or have updates to share
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-zapier-orange hover:bg-zapier-orange/90"
          disabled={isSubmitting || !formData.subject || !formData.message || (allowContact && !formData.email)}
        >
          {isSubmitting ? (
            'Sending...'
          ) : (
            <>
              Send Feedback
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};