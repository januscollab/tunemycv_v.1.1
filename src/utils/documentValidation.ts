export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export const validateJobDescription = (extractedText: string, fileName: string): ValidationResult => {
  const lowerText = extractedText.toLowerCase();
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  
  let confidence = 50; // Start neutral
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Job description specific keywords
  const jobKeywords = [
    'responsibilities', 'duties', 'requirements', 'qualifications', 'experience',
    'skills', 'position', 'role', 'job', 'candidate', 'applicant', 'hiring',
    'salary', 'benefits', 'location', 'department', 'company', 'team',
    'reports to', 'manages', 'supervises', 'degree', 'education',
    'years of experience', 'preferred', 'required', 'must have',
    'job description', 'job posting', 'vacancy', 'opening'
  ];
  
  // CV-specific keywords that would indicate this is NOT a job description
  const cvKeywords = [
    'curriculum vitae', 'resume', 'cv', 'personal statement', 'objective',
    'summary of qualifications', 'work history', 'employment history',
    'achievements', 'accomplishments', 'references available',
    'contact information', 'phone number', 'email address',
    'linkedin profile', 'portfolio', 'certifications earned'
  ];
  
  // Count job description indicators
  const jobKeywordMatches = jobKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const cvKeywordMatches = cvKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // Boost confidence for job description indicators
  confidence += Math.min(jobKeywordMatches * 8, 40);
  
  // Reduce confidence for CV indicators
  confidence -= Math.min(cvKeywordMatches * 15, 50);
  
  // Check for typical job description structure
  const hasJobTitle = /job title|position|role/i.test(extractedText);
  const hasResponsibilities = /responsibilities|duties|accountable|responsible/i.test(lowerText);
  const hasRequirements = /requirements|qualifications|required|must have|preferred/i.test(lowerText);
  const hasCompanyInfo = /company|organization|department/i.test(lowerText);
  
  if (hasJobTitle) confidence += 10;
  if (hasResponsibilities) confidence += 10;
  if (hasRequirements) confidence += 10;
  if (hasCompanyInfo) confidence += 5;
  
  // Check document length (job descriptions are typically substantial)
  if (wordCount < 50) {
    confidence -= 20;
    issues.push('Document seems too short for a typical job description');
  } else if (wordCount > 100 && wordCount < 500) {
    confidence += 10;
  }
  
  // Strong indicators this might be a CV instead
  if (cvKeywordMatches > jobKeywordMatches && cvKeywordMatches > 2) {
    issues.push('This document appears to be a CV/Resume rather than a job description');
    suggestions.push('Please upload the job description for the role you\'re applying to');
  }
  
  // Check for personal pronouns (common in CVs, less common in job descriptions)
  const personalPronouns = (lowerText.match(/\b(i |my |me |myself |i'm |i've |i'll )\b/g) || []).length;
  if (personalPronouns > 5) {
    confidence -= 15;
    issues.push('Contains many personal pronouns, which is unusual for job descriptions');
  }
  
  // Final assessment
  confidence = Math.max(0, Math.min(100, confidence));
  
  if (confidence < 60) {
    issues.push('This doesn\'t appear to be a typical job description');
    suggestions.push('Ensure you\'re uploading the job posting/description, not your CV');
  }
  
  return {
    isValid: confidence >= 60,
    confidence,
    issues,
    suggestions
  };
};

export const validateCV = (extractedText: string, fileName: string): ValidationResult => {
  const lowerText = extractedText.toLowerCase();
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  
  let confidence = 50; // Start neutral
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // CV-specific keywords
  const cvKeywords = [
    'experience', 'education', 'skills', 'qualifications', 'achievements',
    'accomplishments', 'employment', 'work history', 'career', 'professional',
    'university', 'college', 'degree', 'certification', 'training',
    'resume', 'curriculum vitae', 'cv', 'personal statement', 'objective',
    'summary', 'profile', 'references', 'contact', 'phone', 'email',
    'linkedin', 'portfolio', 'projects', 'volunteer', 'languages'
  ];
  
  // Job description keywords that would indicate this is NOT a CV
  const jobDescKeywords = [
    'job description', 'job posting', 'position available', 'we are looking for',
    'the ideal candidate', 'responsibilities include', 'you will be responsible',
    'we offer', 'salary range', 'benefits package', 'apply now',
    'job requirements', 'company description', 'about the role',
    'reporting to', 'team structure', 'office location'
  ];
  
  // Count CV indicators
  const cvKeywordMatches = cvKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const jobDescKeywordMatches = jobDescKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // Boost confidence for CV indicators
  confidence += Math.min(cvKeywordMatches * 6, 35);
  
  // Reduce confidence for job description indicators
  confidence -= Math.min(jobDescKeywordMatches * 12, 40);
  
  // Check for typical CV structure
  const hasExperience = /experience|work|employment|job|position|role|career|professional/i.test(lowerText);
  const hasEducation = /education|university|college|degree|school|qualification|diploma|certificate/i.test(lowerText);
  const hasEmail = /@/.test(extractedText);
  const hasSkills = /skills|competencies|proficiencies|abilities/i.test(lowerText);
  
  if (hasExperience) confidence += 10;
  if (hasEducation) confidence += 10;
  if (hasEmail) confidence += 8;
  if (hasSkills) confidence += 5;
  
  // Check for personal pronouns (common in CVs)
  const personalPronouns = (lowerText.match(/\b(i |my |me |myself |i'm |i've |i'll )\b/g) || []).length;
  if (personalPronouns > 3) {
    confidence += 10;
  }
  
  // Check document length (CVs are typically substantial)
  if (wordCount < 75) {
    confidence -= 15;
    issues.push('CV seems quite short for a typical resume');
  } else if (wordCount > 150 && wordCount < 800) {
    confidence += 10;
  }
  
  // Strong indicators this might be a job description instead
  if (jobDescKeywordMatches > cvKeywordMatches && jobDescKeywordMatches > 2) {
    issues.push('This document appears to be a job description rather than a CV/Resume');
    suggestions.push('Please upload your CV/Resume, not the job description');
  }
  
  // Check for company-centric language (indicates job description)
  const companyLanguage = (lowerText.match(/\b(we are|our company|our team|join us|apply now)\b/g) || []).length;
  if (companyLanguage > 2) {
    confidence -= 20;
    issues.push('Contains company-centric language typical of job descriptions');
  }
  
  // Final assessment
  confidence = Math.max(0, Math.min(100, confidence));
  
  if (confidence < 60) {
    issues.push('This doesn\'t appear to be a typical CV/Resume');
    suggestions.push('Ensure you\'re uploading your CV/Resume, not a job description');
  }
  
  return {
    isValid: confidence >= 60,
    confidence,
    issues,
    suggestions
  };
};