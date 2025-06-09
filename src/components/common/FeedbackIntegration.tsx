import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

const FeedbackIntegration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allowContact, setAllowContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    customSubject: '',
    message: ''
  });
  const [characterCount, setCharacterCount] = useState(0);
  const location = useLocation();
  const { toast } = useToast();

  const maxCharacters = 1000;

  const feedbackCategories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'appreciation', label: 'Appreciation' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'ai-query', label: 'AI Query' },
    { value: 'custom', label: 'Other (please specify)' }
  ];

  // Get current page context
  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'homepage';
    if (pathname.includes('/analyze')) return 'analyze';
    if (pathname.includes('/resources')) return 'resources';
    if (pathname.includes('/profile')) return 'profile';
    return 'default';
  };

  const getContextualMessage = () => {
    const messages = {
      homepage: "Help us improve your experience!",
      analyze: "How was your CV analysis experience? Any suggestions for improvement?",
      resources: "Found our resources helpful? Let us know what else you'd like to see!",
      profile: "How can we improve your profile and dashboard experience?",
      default: "Your feedback helps us build better tools for job seekers like you!"
    };
    return messages[getCurrentPage() as keyof typeof messages] || messages.default;
  };

  // Listen for the custom feedback event
  useEffect(() => {
    const handleOpenFeedback = () => {
      setIsOpen(true);
    };

    window.addEventListener('openFeedback', handleOpenFeedback);
    
    return () => {
      window.removeEventListener('openFeedback', handleOpenFeedback);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'message') {
      setCharacterCount(value.length);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = feedbackCategories.find(c => c.value === categoryId);
    if (category && category.value !== 'custom') {
      setFormData(prev => ({ ...prev, subject: category.label }));
    } else {
      setFormData(prev => ({ ...prev, subject: '' }));
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
          subject: selectedCategory === 'custom' ? formData.customSubject : formData.subject,
          message: formData.message,
          category: selectedCategory,
          currentPage: getCurrentPage(),
          allowContact
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        handleClose();
      }, 3000);

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

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', subject: '', customSubject: '', message: '' });
    setAllowContact(false);
    setCharacterCount(0);
    setSelectedCategory('general');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zapier-orange" />
                Share Your Feedback
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 border border-zapier-orange/20 rounded-lg p-3">
                <p className="text-caption text-earth dark:text-white">
                  {getContextualMessage()}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <FloatingLabelInput
                    id="name"
                    label="Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name (optional)"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <FloatingLabelInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={allowContact ? "your@email.com (required)" : "your@email.com (optional)"}
                    required={allowContact}
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">What type of feedback is this?</Label>
                  <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory === 'custom' && (
                  <div>
                    <Label htmlFor="customSubject">Custom Subject</Label>
                    <FloatingLabelInput
                      id="customSubject"
                      label="Custom Subject"
                      type="text"
                      value={formData.customSubject || ''}
                      onChange={(e) => handleInputChange('customSubject', e.target.value)}
                      placeholder="Enter your custom subject"
                      required
                      maxLength={200}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Your Feedback</Label>
                  <FloatingLabelTextarea
                    id="message"
                    label="Your Feedback"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please share your feedback, ideas, or issues..."
                    className="min-h-[100px]"
                    required
                    maxLength={maxCharacters}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-micro text-muted-foreground">
                      Share your thoughts, ideas, or issues...
                    </div>
                    <div className={`text-micro transition-colors ${
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
                    className="text-caption leading-relaxed cursor-pointer"
                  >
                    Yes, you can contact me about my feedback
                    <span className="text-micro text-muted-foreground block mt-1">
                      We'll only reach out if we need clarification or have updates to share
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-zapier-orange hover:bg-zapier-orange/90"
                    disabled={isSubmitting || !formData.message || (allowContact && !formData.email) || (selectedCategory === 'custom' && !formData.customSubject)}
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
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                Feedback Sent Successfully!
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-subheading font-semibold text-earth dark:text-white mb-2">
                  Thank you for your feedback!
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  Your feedback has been sent successfully. We truly appreciate you helping us improve TuneMyCV!
                </p>
                <div className="text-caption text-muted-foreground mt-2">
                  This window will close automatically...
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackIntegration;