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

export const assessDocumentQuality = (
  extractedText: string,
  fileName: string,
  documentType: 'cv' | 'job_description'
): QualityAssessment => {
  const issues: QualityIssue[] = [];
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = extractedText.length;
  
  let score = 100;

  // Check for empty or very short content
  if (wordCount < 10) {
    issues.push({
      type: 'error',
      title: 'Document appears empty or too short',
      description: 'We extracted very little text from your document.',
      suggestion: 'Try uploading a text-based PDF or DOCX file, or use the text input option instead.',
      helpUrl: '#document-quality'
    });
    score -= 50;
  } else if (documentType === 'cv' && wordCount < 100) {
    issues.push({
      type: 'warning',
      title: 'CV seems quite short',
      description: `We extracted ${wordCount} words, which is shorter than typical CVs.`,
      suggestion: 'Ensure your CV includes all relevant sections like experience, education, and skills.',
      helpUrl: '#document-quality'
    });
    score -= 20;
  } else if (documentType === 'job_description' && wordCount < 50) {
    issues.push({
      type: 'warning',
      title: 'Job description seems short',
      description: `We extracted ${wordCount} words, which may not include all job requirements.`,
      suggestion: 'Make sure to include the complete job description with requirements and responsibilities.',
      helpUrl: '#document-quality'
    });
    score -= 15;
  }

  // Check for potential extraction issues
  const hasGarbledText = /[^\w\s\-.,;:()!?'"@#$%&*+=<>{}[\]|\\\/~`]+/.test(extractedText);
  if (hasGarbledText) {
    issues.push({
      type: 'warning',
      title: 'Possible formatting issues detected',
      description: 'Some text may not have extracted correctly.',
      suggestion: 'Try converting your document to a text-based format or use our text input option.',
      helpUrl: '#document-quality'
    });
    score -= 25;
  }

  // Check for image-based PDF indicators
  const hasMinimalText = wordCount < 50 && characterCount > 200;
  if (hasMinimalText) {
    issues.push({
      type: 'warning',
      title: 'Document might be image-based',
      description: 'This appears to be a scanned document or image-based PDF.',
      suggestion: 'For best results, use a text-based PDF or convert to DOCX/TXT format.',
      helpUrl: '#document-quality'
    });
    score -= 30;
  }

  // Check for missing key CV sections (if CV)
  if (documentType === 'cv' && wordCount > 50) {
    const lowerText = extractedText.toLowerCase();
    const hasEmail = /@/.test(extractedText);
    const hasExperience = /experience|work|employment|job|position|role/.test(lowerText);
    const hasEducation = /education|university|college|degree|school/.test(lowerText);
    
    if (!hasEmail) {
      issues.push({
        type: 'info',
        title: 'No email address detected',
        description: 'We couldn\'t find contact information in your CV.',
        suggestion: 'Ensure your contact details are clearly visible and not in headers/footers.',
        helpUrl: '#document-quality'
      });
      score -= 5;
    }
    
    if (!hasExperience) {
      issues.push({
        type: 'info',
        title: 'Work experience section unclear',
        description: 'We couldn\'t clearly identify work experience information.',
        suggestion: 'Make sure your work experience section uses clear headings and formatting.',
        helpUrl: '#document-quality'
      });
      score -= 10;
    }
    
    if (!hasEducation) {
      issues.push({
        type: 'info',
        title: 'Education section unclear',
        description: 'We couldn\'t clearly identify education information.',
        suggestion: 'Ensure your education section is clearly formatted and labeled.',
        helpUrl: '#document-quality'
      });
      score -= 5;
    }
  }

  // Positive indicators
  if (issues.length === 0) {
    issues.push({
      type: 'info',
      title: 'Great extraction quality!',
      description: `Successfully extracted ${wordCount} words with clear formatting.`,
      suggestion: 'Your document looks ready for analysis.',
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
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
};