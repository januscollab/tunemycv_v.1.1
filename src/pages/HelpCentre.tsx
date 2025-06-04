
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageCircle, HelpCircle, CreditCard, FileText, Search, Zap } from 'lucide-react';

const HelpCentre = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <Zap className="h-5 w-5" />,
      faqs: [
        {
          question: "How do I analyze my CV?",
          answer: "Upload your CV and provide a job description (by pasting text or uploading a file). Our AI will analyze compatibility and provide detailed recommendations including keyword analysis, skills gap assessment, and personalized suggestions."
        },
        {
          question: "What file formats are supported?",
          answer: "We support PDF, DOCX, and TXT files up to 5MB in size for both CVs and job descriptions. You can also paste job descriptions directly as text."
        },
        {
          question: "How accurate is the analysis?",
          answer: "Our AI-powered analysis uses advanced natural language processing to provide detailed insights with industry-standard accuracy. If you notice any errors, you can report them using the bug report feature in your analysis results."
        },
        {
          question: "Can I save my CVs for future use?",
          answer: "Yes! You can save your CVs in your profile for quick access in future analyses. Manage your saved CVs in the CV Management section of your profile."
        }
      ]
    },
    {
      title: "CV Analysis",
      icon: <FileText className="h-5 w-5" />,
      faqs: [
        {
          question: "What does the compatibility score mean?",
          answer: "The compatibility score (0-100%) indicates how well your CV matches the job requirements. Scores above 80% are excellent, 70-79% are good, 50-69% are moderate, and below 50% need improvement."
        },
        {
          question: "How are keywords identified?",
          answer: "Our enhanced AI system extracts key terms from the job description and analyzes their context, relevance, and frequency in your CV. We identify both present and missing keywords with detailed recommendations."
        },
        {
          question: "Can I save my analysis results?",
          answer: "Yes, all analysis results are automatically saved to your profile. Access them from the Analysis History tab in your profile, where you can view, download, or generate cover letters from past analyses."
        },
        {
          question: "What's included in the analysis report?",
          answer: "Our comprehensive reports include executive summary, compatibility breakdown, keyword analysis, skills gap assessment, ATS optimization tips, and interview preparation insights with personalized recommendations."
        }
      ]
    },
    {
      title: "Applicant Tracking System (ATS) & Keywords",
      icon: <Search className="h-5 w-5" />,
      faqs: [
        {
          question: "What is an Applicant Tracking System (ATS)?",
          answer: "An Applicant Tracking System (ATS) is software used by employers to filter and rank job applications. It scans CVs for relevant keywords, formatting, and qualifications before human review."
        },
        {
          question: "How do I optimize my CV for Applicant Tracking System (ATS)?",
          answer: "Use standard formatting, include relevant keywords from the job description, avoid graphics or unusual fonts, and structure your CV with clear sections."
        },
        {
          question: "Why are keywords important?",
          answer: "Keywords help Applicant Tracking Systems (ATS) and recruiters quickly identify if your experience matches job requirements. Missing key terms can result in your CV being filtered out."
        }
      ]
    },
    {
      title: "Cover Letter Generation",
      icon: <FileText className="h-5 w-5" />,
      faqs: [
        {
          question: "How do I generate a cover letter?",
          answer: "You can generate cover letters from your analysis results or by manually entering job details. Navigate to the Generate Cover Letter page and choose your preferred method."
        },
        {
          question: "Can I customize my cover letter?",
          answer: "Yes! You can choose from different tones (professional, conversational, confident, etc.), adjust length, add work experience highlights, personal values, and custom opening hooks."
        },
        {
          question: "How many times can I regenerate a cover letter?",
          answer: "You get 2 free regenerations per cover letter. After that, each regeneration uses 1 credit. You can also edit the generated text directly."
        },
        {
          question: "Does the cover letter include my contact information?",
          answer: "Yes! If you've completed your profile with contact details, we'll automatically populate your name, phone number, email, LinkedIn URL, and personal website URL in the cover letter header."
        }
      ]
    },
    {
      title: "Credits & Billing",
      icon: <CreditCard className="h-5 w-5" />,
      faqs: [
        {
          question: "How do credits work?",
          answer: "Each comprehensive AI analysis uses 1 credit. Cover letter generation also uses 1 credit, with 2 free regenerations per cover letter. You start with 5 free credits, and can purchase more as needed."
        },
        {
          question: "What can I do with my credits?",
          answer: "Use credits for CV analysis, cover letter generation, and interview preparation features. Check your credit balance in the top navigation or your profile settings."
        },
        {
          question: "What's the difference between free and paid analysis?",
          answer: "Free analysis provides basic compatibility scoring, while paid analysis includes detailed insights, recommendations, and Applicant Tracking System (ATS) optimization."
        },
        {
          question: "How can I get more credits?",
          answer: "You can purchase additional credits through your profile page. We offer various packages to suit your needs."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: <HelpCircle className="h-5 w-5" />,
      faqs: [
        {
          question: "My file won't upload. What should I do?",
          answer: "Ensure your file is under 5MB and in PDF, DOCX, or TXT format. Try refreshing the page or using a different browser if issues persist."
        },
        {
          question: "The analysis is taking too long. Is this normal?",
          answer: "Analysis typically takes 30-60 seconds. If it takes longer, please refresh the page and try again. Contact support if the issue continues."
        },
        {
          question: "Can I use the service on mobile devices?",
          answer: "Yes, our platform is fully responsive and works on all devices including smartphones and tablets."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Help Centre</h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mb-6">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blueberry dark:text-citrus">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-blueberry/70 dark:text-apple-core/80">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blueberry dark:text-citrus">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll help you out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white font-normal"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-4 pt-4 border-t border-apple-core/20 dark:border-citrus/20">
                  <p className="text-xs text-blueberry/60 dark:text-apple-core/60 text-center">
                    We typically respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCentre;
