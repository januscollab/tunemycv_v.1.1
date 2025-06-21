import { createSecureFileObject } from '@/utils/secureFileValidation';

export interface CVValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export const validateCV = (text: string, fileName: string = ''): CVValidationResult => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let confidence = 100;

  // Check minimum length
  if (text.length < 100) {
    issues.push('CV is too short to be effective');
    confidence -= 20;
  }

  // Check for essential sections
  const sectionKeywords = ['experience', 'education', 'skills'];
  const foundSections = sectionKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (foundSections.length < 2) {
    issues.push('CV lacks essential sections (experience, education, skills)');
    confidence -= 25;
    suggestions.push('Ensure your CV includes sections detailing your experience, education, and skills');
  }

  // Check for contact information
  const contactKeywords = ['phone', 'email', 'linkedin'];
  const foundContactInfo = contactKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (foundContactInfo.length === 0) {
    issues.push('CV lacks contact information');
    confidence -= 15;
    suggestions.push('Include your phone number, email address, and LinkedIn profile URL');
  }

  // Check for action verbs
  const actionVerbs = ['managed', 'developed', 'led', 'created', 'implemented'];
  const foundActionVerbs = actionVerbs.filter(verb =>
    text.toLowerCase().includes(verb)
  );

  if (foundActionVerbs.length < 3) {
    issues.push('CV lacks strong action verbs to describe accomplishments');
    confidence -= 10;
    suggestions.push('Use action verbs to start sentences and describe your accomplishments');
  }

  // Check for formatting issues (simulated)
  if (text.split('\n').length < 5) {
    issues.push('CV appears to have poor formatting');
    confidence -= 10;
    suggestions.push('Use clear formatting, bullet points, and headings to improve readability');
  }

  // Check file name for hints
  const cvIndicators = ['cv', 'resume', 'curriculum'];
  const jdIndicators = ['job', 'position', 'role', 'vacancy', 'opening'];
  
  const fileNameLower = fileName.toLowerCase();
  const hasCVIndicator = cvIndicators.some(indicator => fileNameLower.includes(indicator));
  const hasJDIndicator = jdIndicators.some(indicator => fileNameLower.includes(indicator));

  if (hasJDIndicator && !hasCVIndicator) {
    issues.push('File name suggests this might be a job description rather than a CV');
    confidence -= 15;
  }

  // Determine if valid
  const isValid = confidence >= 70;

  if (!isValid) {
    suggestions.push('Consider reviewing the document content to ensure it includes all necessary information');
  }

  return {
    isValid,
    confidence,
    issues,
    suggestions
  };
};

export interface JobDescriptionValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export const validateJobDescription = (text: string, fileName: string = ''): JobDescriptionValidation => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let confidence = 100;

  // Check minimum length
  if (text.length < 50) {
    issues.push('Document is too short to be a job description');
    confidence -= 30;
  }

  // Check for job description indicators
  const jobDescriptionKeywords = [
    'responsibilities', 'requirements', 'qualifications', 'duties',
    'job title', 'position', 'role', 'candidate', 'applicant',
    'salary', 'benefits', 'company', 'team', 'department',
    'apply', 'application', 'hiring', 'recruitment'
  ];

  const foundKeywords = jobDescriptionKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (foundKeywords.length < 3) {
    issues.push('Document may not be a job description - lacks typical job posting keywords');
    confidence -= 20;
    suggestions.push('Ensure this document contains job requirements, responsibilities, and qualifications');
  }

  // Check for personal information (suggests it might be a CV)
  const personalKeywords = [
    'my name', 'i am', 'i have', 'my experience', 'my skills',
    'i worked', 'i studied', 'my education', 'my background'
  ];

  const foundPersonalKeywords = personalKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (foundPersonalKeywords.length > 2) {
    issues.push('Document appears to contain personal information - may be a CV instead of job description');
    confidence -= 25;
    suggestions.push('Please ensure you are uploading a job description, not a CV');
  }

  // Check file name for hints
  const cvIndicators = ['cv', 'resume', 'curriculum'];
  const jdIndicators = ['job', 'position', 'role', 'vacancy', 'opening'];
  
  const fileNameLower = fileName.toLowerCase();
  const hasCVIndicator = cvIndicators.some(indicator => fileNameLower.includes(indicator));
  const hasJDIndicator = jdIndicators.some(indicator => fileNameLower.includes(indicator));

  if (hasCVIndicator && !hasJDIndicator) {
    issues.push('File name suggests this might be a CV rather than job description');
    confidence -= 15;
  }

  // Determine if valid
  const isValid = confidence >= 70;

  if (!isValid) {
    suggestions.push('Consider reviewing the document content to ensure it describes a job role and requirements');
  }

  return {
    isValid,
    confidence,
    issues,
    suggestions
  };
};

// Secure file validation (example - implement actual checks)
export const validateSecureFile = (file: File): boolean => {
  // Implement actual checks here (e.g., file signature, content analysis)
  // This is a placeholder - replace with real security measures
  return true;
};

export interface DocumentTypeDetection {
  type: 'cv' | 'job_description' | 'unknown';
  confidence: number;
}

export interface QualityAssessment {
  score: number;
  feedback: string[];
}
