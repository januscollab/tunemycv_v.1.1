export interface QualityIssue {
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  suggestion: string;
  helpUrl?: string;
}

export interface QualityAssessment {
  score: number; // 0-100
  issues: QualityIssue[];
  isAcceptable: boolean;
  wordCount: number;
  characterCount: number;
}

// Separate quality assessment functions for different document types
const assessCVQuality = (extractedText: string, wordCount: number): { score: number; issues: QualityIssue[] } => {
  const issues: QualityIssue[] = [];
  let score = 85;

  // CV-specific assessments
  if (wordCount < 75) {
    issues.push({
      type: 'warning',
      title: 'CV seems quite short',
      description: `We extracted ${wordCount} words, which is shorter than typical CVs.`,
      suggestion: 'Ensure your CV includes all relevant sections like experience, education, and skills.'
    });
    score -= 10;
  }

  const lowerText = extractedText.toLowerCase();
  const hasEmail = /@/.test(extractedText);
  const hasExperience = /experience|work|employment|job|position|role|career|professional|responsibilities|achievements|accomplishments|worked|employed|managed|led|developed|created/.test(lowerText);
  const hasEducation = /education|university|college|degree|school|qualification|diploma|certificate|studied|graduated|bachelor|master|phd|training|course/.test(lowerText);
  
  // Positive scoring for good structure
  let structureBonus = 0;
  if (hasEmail) structureBonus += 2;
  if (hasExperience) structureBonus += 3;
  if (hasEducation) structureBonus += 2;
  score += structureBonus;
  
  if (!hasEmail) {
    issues.push({
      type: 'info',
      title: 'Contact information not clearly visible',
      description: 'We couldn\'t find an email address in your CV.',
      suggestion: 'Ensure your contact details are clearly visible and not in headers/footers.'
    });
    score -= 2;
  }
  
  if (!hasExperience) {
    issues.push({
      type: 'info',
      title: 'Experience section could be clearer',
      description: 'We couldn\'t clearly identify work experience keywords.',
      suggestion: 'Consider using standard headings like "Experience", "Work History", or "Career".'
    });
    score -= 3;
  }
  
  if (!hasEducation) {
    issues.push({
      type: 'info',
      title: 'Education section could be clearer',
      description: 'We couldn\'t clearly identify education keywords.',
      suggestion: 'Consider using standard headings like "Education", "Qualifications", or "Training".'
    });
    score -= 2;
  }

  return { score, issues };
};

const assessJobDescriptionQuality = (extractedText: string, wordCount: number): { score: number; issues: QualityIssue[] } => {
  const issues: QualityIssue[] = [];
  let score = 90; // Start higher for job descriptions

  // Job description specific assessments
  if (wordCount < 50) {
    issues.push({
      type: 'warning',
      title: 'Job description seems short',
      description: `We extracted ${wordCount} words, which may not include all job requirements.`,
      suggestion: 'Make sure to include the complete job description with requirements and responsibilities.'
    });
    score -= 10;
  }

  const lowerText = extractedText.toLowerCase();
  
  // Look for key job description sections
  const hasJobTitle = /job title|position|role/.test(lowerText) || /title:/i.test(extractedText);
  const hasResponsibilities = /responsibilities|duties|accountable|responsible|key responsibilities|main duties/.test(lowerText);
  const hasRequirements = /requirements|qualifications|experience|skills|education|required|minimum|preferred/.test(lowerText);
  const hasCompanyInfo = /company|organization|about|department|location/.test(lowerText);
  
  // Positive scoring for comprehensive job descriptions
  let structureBonus = 0;
  if (hasJobTitle) structureBonus += 5;
  if (hasResponsibilities) structureBonus += 5;
  if (hasRequirements) structureBonus += 5;
  if (hasCompanyInfo) structureBonus += 2;
  
  // Bonus for well-structured, comprehensive content
  if (wordCount >= 200 && wordCount <= 1000) structureBonus += 3;
  if (wordCount >= 100 && hasJobTitle && hasResponsibilities && hasRequirements) structureBonus += 5;
  
  score += structureBonus;

  // Only add minor suggestions if missing key sections
  if (!hasJobTitle) {
    issues.push({
      type: 'info',
      title: 'Job title could be clearer',
      description: 'We couldn\'t clearly identify the job title.',
      suggestion: 'Consider starting with a clear job title or position name.'
    });
  }
  
  if (!hasResponsibilities && wordCount > 50) {
    issues.push({
      type: 'info',
      title: 'Responsibilities section could be clearer',
      description: 'We couldn\'t clearly identify job responsibilities.',
      suggestion: 'Consider including a section with key responsibilities or duties.'
    });
  }
  
  if (!hasRequirements && wordCount > 50) {
    issues.push({
      type: 'info',
      title: 'Requirements section could be clearer',
      description: 'We couldn\'t clearly identify job requirements.',
      suggestion: 'Consider including required qualifications, skills, or experience.'
    });
  }

  return { score, issues };
};

export const assessDocumentQuality = (
  extractedText: string,
  fileName: string,
  documentType: 'cv' | 'job_description'
): QualityAssessment => {
  const issues: QualityIssue[] = [];
  
  // Check for extraction failure first
  const isExtractionFailure = /\[Text extraction from .+ failed\]/.test(extractedText) || 
                             /Failed to extract text/.test(extractedText);
  
  if (isExtractionFailure) {
    return {
      score: 0,
      issues: [{
        type: 'error',
        title: 'Document extraction failed',
        description: 'Unable to extract text from this document.',
        suggestion: 'Try uploading a different format or use the text input option instead.'
      }],
      isAcceptable: false,
      wordCount: 0,
      characterCount: extractedText.length
    };
  }
  
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = extractedText.length;
  
  let score: number;
  let documentIssues: QualityIssue[];

  // Check for empty or very short content first
  if (wordCount < 10) {
    issues.push({
      type: 'error',
      title: 'Document appears empty or too short',
      description: 'We extracted very little text from your document.',
      suggestion: 'Try uploading a text-based PDF or DOCX file, or use the text input option instead.'
    });
    return {
      score: 20,
      issues,
      isAcceptable: false,
      wordCount,
      characterCount
    };
  }

  // Use document-specific assessment logic
  if (documentType === 'cv') {
    const cvAssessment = assessCVQuality(extractedText, wordCount);
    score = cvAssessment.score;
    documentIssues = cvAssessment.issues;
  } else {
    const jdAssessment = assessJobDescriptionQuality(extractedText, wordCount);
    score = jdAssessment.score;
    documentIssues = jdAssessment.issues;
  }

  issues.push(...documentIssues);

  // Check for potential extraction issues - much more lenient
  // Only check for truly problematic characters that affect readability
  const problematicChars = extractedText.match(/[^\w\s\-.,;:()!?'"@#$%&*+=<>{}[\]|\\\/~`•–—""''…°\n\r\t]+/g);
  if (problematicChars && problematicChars.length > 5) {
    issues.push({
      type: 'info',
      title: 'Minor formatting detected',
      description: 'Some special characters were automatically cleaned up during extraction.',
      suggestion: 'Text has been optimized for better analysis.'
    });
  }

  // Check for image-based PDF indicators
  const hasMinimalText = wordCount < 50 && characterCount > 200;
  if (hasMinimalText) {
    issues.push({
      type: 'warning',
      title: 'Document might be image-based',
      description: 'This appears to be a scanned document or image-based PDF.',
      suggestion: 'For best results, use a text-based PDF or convert to DOCX/TXT format.'
    });
    score -= 10;
  }

  // Add positive feedback for excellent documents
  if (score >= 95 && issues.filter(i => i.type === 'error' || i.type === 'warning').length === 0) {
    issues.unshift({
      type: 'info',
      title: 'Excellent document quality!',
      description: `Successfully extracted ${wordCount} words with perfect formatting and structure.`,
      suggestion: 'Your document is optimized for high-quality analysis.',
    });
  } else if (score >= 85 && issues.filter(i => i.type === 'error').length === 0) {
    issues.unshift({
      type: 'info',
      title: 'High-quality document',
      description: `Successfully extracted ${wordCount} words with good structure and formatting.`,
      suggestion: 'Your document is ready for analysis.',
    });
  }

  const isAcceptable = score >= 40 && wordCount >= 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    isAcceptable,
    wordCount,
    characterCount
  };
};

export const getQualityColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getQualityBadge = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Acceptable';
  return 'Needs Improvement';
};