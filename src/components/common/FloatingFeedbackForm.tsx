import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Lightbulb, Bug, Heart, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FloatingLabelInput } from './FloatingLabelInput';
import { FloatingLabelTextarea } from './FloatingLabelTextarea';

interface FloatingFeedbackFormProps {
  onClose: () => void;
  currentPage?: string;
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
  currentPage = 'homepage' 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowContact, setAllowContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
    if (category) {
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 animate-scale-in">
          <Heart className="w-8 h-8 text-green-500 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-blueberry dark:text-citrus mb-3">
          Thank You! 🎉
        </h3>
        <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
          Your feedback has been sent successfully. We truly appreciate you helping us improve TuneMyCV!
        </p>
        <div className="text-sm text-blueberry/60 dark:text-apple-core/60">
          This window will close automatically...
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Category Selection */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-3">
          What type of feedback is this?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {feedbackCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-left
                  hover:scale-105 hover:shadow-md group animate-fade-in
                  ${selectedCategory === category.id 
                    ? 'border-zapier-orange bg-zapier-orange/10' 
                    : 'border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50'
                  }
                `}
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full ${category.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blueberry dark:text-citrus group-hover:text-zapier-orange transition-colors">
                    {category.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Form Fields */}
      <div className="space-y-5 flex-1 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="grid grid-cols-2 gap-4">
          <FloatingLabelInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            label="Name (optional)"
            disabled={isSubmitting}
          />
          <FloatingLabelInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            label={allowContact ? "Email (required for contact)" : "Email (optional)"}
            required={allowContact}
            disabled={isSubmitting}
          />
        </div>

        <FloatingLabelInput
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          label="Subject"
          required
          disabled={isSubmitting}
        />

        <div className="relative">
          <FloatingLabelTextarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            label="Your feedback"
            required
            disabled={isSubmitting}
            maxLength={maxCharacters}
            rows={4}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-blueberry/50 dark:text-apple-core/50">
              Share your thoughts, ideas, or issues...
            </div>
            <div className={`text-xs transition-colors ${
              characterCount > maxCharacters * 0.9 
                ? 'text-red-500' 
                : 'text-blueberry/50 dark:text-apple-core/50'
            }`}>
              {characterCount}/{maxCharacters}
            </div>
          </div>
        </div>

        {/* Contact Permission */}
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-surface/50 dark:bg-blueberry/20">
          <Checkbox
            id="allowContact"
            checked={allowContact}
            onCheckedChange={(checked) => setAllowContact(checked as boolean)}
            disabled={isSubmitting}
            className="mt-0.5"
          />
          <label 
            htmlFor="allowContact" 
            className="text-sm text-blueberry dark:text-citrus leading-relaxed cursor-pointer"
          >
            Yes, you can contact me about my feedback
            <span className="text-xs text-blueberry/60 dark:text-apple-core/60 block mt-1">
              We'll only reach out if we need clarification or have updates to share
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.subject || !formData.message || (allowContact && !formData.email)}
          className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white font-semibold h-12 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Sending your feedback...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send Feedback</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};