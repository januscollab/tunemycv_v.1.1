import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    customSubject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const commonQueries = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'partnership', label: 'Partnership Opportunities' },
    { value: 'custom', label: 'Other (please specify)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds and close modal
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', customSubject: '', message: '' });
      onClose();
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', subject: '', customSubject: '', message: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-zapier-orange" />
                Contact Us
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 border border-zapier-orange/20 rounded-lg p-3">
                <p className="text-sm text-earth dark:text-white">
                  We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.
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
                    placeholder="Your full name"
                    required
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
                    placeholder="your@email.com"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject or choose 'Other'" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonQueries.map((query) => (
                        <SelectItem key={query.value} value={query.value}>
                          {query.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.subject === 'custom' && (
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
                  <Label htmlFor="message">Message</Label>
                  <FloatingLabelTextarea
                    id="message"
                    label="Message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please share your message, question, or feedback..."
                    className="min-h-[100px]"
                    required
                    maxLength={2000}
                  />
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
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message || (formData.subject === 'custom' && !formData.customSubject)}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
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
                Message Sent Successfully!
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-earth dark:text-white mb-2">
                  Thank you for reaching out!
                </h3>
                <p className="text-earth/70 dark:text-white/70">
                  We've received your message and will get back to you within 24 hours.
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};