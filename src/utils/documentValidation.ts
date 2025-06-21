
import { createSecureFileObject } from '@/utils/secureFileValidation';

export interface CVValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export interface JobDescriptionValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

// Generic validation result type
export type ValidationResult = CVValidationResult | JobDescriptionValidation;

export interface DocumentTypeDetection {
  detectedType: 'cv' | 'job_description' | 'unknown';
  confidence: number;
  needsUserConfirmation: boolean;
}

export interface QualityAssessment {
  score: number;
  issues: string[];
  isAcceptable: boolean;
  wordCount: number;
  characterCount: number;
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

export const detectDocumentType = (text: string, fileName: string = ''): DocumentTypeDetection => {
  const lowerText = text.toLowerCase();
  const fileNameLower = fileName.toLowerCase();
  
  // File name indicators
  const cvIndicators = ['cv', 'resume', 'curriculum'];
  const jdIndicators = ['job', 'position', 'role', 'vacancy', 'opening'];
  
  const hasCVIndicator = cvIndicators.some(indicator => fileNameLower.includes(indicator));
  const hasJDIndicator = jdIndicators.some(indicator => fileNameLower.includes(indicator));
  
  // Content indicators for CV
  const cvKeywords = [
    'my name', 'i am', 'i have', 'my experience', 'my skills',
    'i worked', 'i studied', 'my education', 'my background',
    'personal statement', 'objective', 'profile'
  ];
  
  // Content indicators for Job Description
  const jdKeywords = [
    'responsibilities', 'requirements', 'qualifications', 'duties',
    'candidate', 'applicant', 'salary', 'benefits', 'hiring',
    'we are looking for', 'join our team', 'apply now'
  ];
  
  const cvScore = cvKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const jdScore = jdKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  let detectedType: 'cv' | 'job_description' | 'unknown' = 'unknown';
  let confidence = 0;
  
  // Determine type based on combined file name and content analysis
  if (hasCVIndicator || cvScore > jdScore) {
    detectedType = 'cv';
    confidence = Math.min(90, 50 + (cvScore * 10) + (hasCVIndicator ? 20 : 0));
  } else if (hasJDIndicator || jdScore > cvScore) {
    detectedType = 'job_description';
    confidence = Math.min(90, 50 + (jdScore * 10) + (hasJDIndicator ? 20 : 0));
  } else {
    confidence = 30;
  }
  
  return {
    detectedType,
    confidence,
    needsUserConfirmation: confidence < 70
  };
};

// Secure file validation (example - implement actual checks)
export const validateSecureFile = (file: File): boolean => {
  // Implement actual checks here (e.g., file signature, content analysis)
  // This is a placeholder - replace with real security measures
  return true;
};
