
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Users, Target, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission - in real implementation, this would send to hello@tunemycv.com
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-subheading text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
            Get in touch with the TuneMyCV team. We're here to help you optimize your career journey.
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-apricot mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">AI-Powered Analysis</h3>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Advanced algorithms analyze your CV against job requirements for maximum compatibility.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-apricot mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">Trusted by Thousands</h3>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Join thousands of professionals who have improved their job prospects with TuneMyCV.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-apricot mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">Expert Support</h3>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Our team of career experts and AI specialists are dedicated to your success.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Centre Prompt */}
        <Card className="bg-citrus/10 border border-citrus/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-blueberry mr-3" />
              <h3 className="text-heading font-semibold text-blueberry dark:text-citrus">Need Quick Answers?</h3>
            </div>
            <p className="text-blueberry/80 dark:text-apple-core mb-4">
              Before reaching out, check our comprehensive Help Centre. Most questions can be answered instantly!
            </p>
            <Link 
              to="/help"
              className="inline-flex items-center text-apricot hover:text-apricot/80 font-medium"
            >
              Visit Help Centre →
            </Link>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
          <CardHeader>
            <CardTitle className="text-title font-semibold text-blueberry dark:text-citrus flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Send us a Message
            </CardTitle>
            <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
              We typically respond within 24 hours during business days.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <FloatingLabelInput
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <FloatingLabelInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <FloatingLabelInput
                  id="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your inquiry"
                  disabled={isSubmitting}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <FloatingLabelTextarea
                  id="message"
                  label="Message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide details about your question or feedback..."
                  className="min-h-[120px]"
                  required
                  disabled={isSubmitting}
                  maxLength={2000}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-apricot hover:bg-apricot/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Contact Info */}
        <div className="text-center mt-8 text-blueberry/70 dark:text-apple-core/80">
          <p className="text-sm">
            You can also reach us directly at{' '}
            <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80">
              hello@tunemycv.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
