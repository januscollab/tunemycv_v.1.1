
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface ManualInputFormProps {
  onGenerate: (data: {
    jobTitle: string;
    companyName: string;
    cvText: string;
    jobDescription: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const ManualInputForm: React.FC<ManualInputFormProps> = ({ onGenerate, disabled = false }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation
    if (!jobTitle.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a job title.',
        variant: 'destructive',
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a company name.',
        variant: 'destructive',
      });
      return;
    }

    if (cvText.trim().length < 100) {
      toast({
        title: 'CV Too Short',
        description: 'Please enter at least 100 characters for your CV.',
        variant: 'destructive',
      });
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast({
        title: 'Job Description Too Short',
        description: 'Please enter at least 50 characters for the job description.',
        variant: 'destructive',
      });
      return;
    }

    await onGenerate({
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      cvText: cvText.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-apricot" />
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus">
          Manual Input Method
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Tech Corp"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvText">Your CV Content</Label>
        <Textarea
          id="cvText"
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder="Paste your CV content here... (minimum 100 characters)"
          rows={8}
          maxLength={15000}
          className="resize-none"
          disabled={disabled}
        />
        <div className="text-sm text-gray-500">
          {cvText.length}/15000 characters {cvText.length < 100 && cvText.length > 0 && '(minimum 100 required)'}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here... (minimum 50 characters)"
          rows={6}
          maxLength={10000}
          className="resize-none"
          disabled={disabled}
        />
        <div className="text-sm text-gray-500">
          {jobDescription.length}/10000 characters {jobDescription.length < 50 && jobDescription.length > 0 && '(minimum 50 required)'}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={disabled || !jobTitle.trim() || !companyName.trim() || cvText.length < 100 || jobDescription.length < 50}
        className="w-full bg-apricot hover:bg-apricot/90"
      >
        Generate Cover Letter
      </Button>
    </div>
  );
};

export default ManualInputForm;
