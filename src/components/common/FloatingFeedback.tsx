
import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FloatingFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowContact, setAllowContact] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          allowContact: allowContact
        }
      });

      if (error) throw error;

      toast({
        title: 'Feedback Sent!',
        description: 'Thank you for your feedback. We\'ll get back to you soon.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setAllowContact(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to send feedback. Please try again or email us directly at hello@tunemycv.com',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Tab - Rotated 90 degrees clockwise */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zapier-orange hover:bg-zapier-orange/90 text-white px-3 py-4 rounded-l-lg shadow-lg transition-all duration-300 hover:shadow-xl group rotate-90 origin-center"
          style={{ transformOrigin: 'center center' }}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs tracking-wider whitespace-nowrap">Feedback</span>
          </div>
        </button>
      </div>

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-blueberry/90 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-apple-core/20 dark:border-citrus/20">
                <div>
                  <h2 className="text-xl font-bold text-blueberry dark:text-citrus">Share Your Feedback</h2>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">
                    We're in beta and value your input!
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-blueberry/60 hover:text-blueberry dark:text-apple-core/60 dark:hover:text-apple-core transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Beta Message */}
              <div className="p-6 bg-zapier-orange/10 border-b border-apple-core/20 dark:border-citrus/20">
                <p className="text-sm text-blueberry dark:text-citrus">
                  🚀 <strong>Beta Version:</strong> Help us improve TuneMyCV! Your feedback shapes our future features and helps us create the best CV optimization experience.
                </p>
              </div>

              {/* Form */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                      Name <span className="text-sm text-blueberry/60 dark:text-apple-core/70">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                      Email <span className="text-sm text-blueberry/60 dark:text-apple-core/70">(optional)</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                      Message
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your feedback, suggestions, or report issues..."
                      rows={5}
                      required
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>

                  {/* Contact Permission Checkbox */}
                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="allowContact"
                      checked={allowContact}
                      onCheckedChange={(checked) => setAllowContact(checked as boolean)}
                      disabled={isSubmitting}
                    />
                    <label 
                      htmlFor="allowContact" 
                      className="text-sm text-blueberry dark:text-citrus leading-relaxed cursor-pointer"
                    >
                      I give permission for TuneMyCV to contact me if needed regarding my feedback
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white font-normal"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Send Feedback</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-apple-core/20 dark:border-citrus/20 bg-gray-50 dark:bg-blueberry/50">
                <p className="text-xs text-blueberry/60 dark:text-apple-core/70 text-center">
                  You can also email us directly at{' '}
                  <a 
                    href="mailto:hello@tunemycv.com" 
                    className="text-zapier-orange hover:underline"
                  >
                    hello@tunemycv.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingFeedback;
