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
  
  let score = 85; // Start with a more generous base score

  // Check for empty or very short content
  if (wordCount < 10) {
    issues.push({
      type: 'error',
      title: 'Document appears empty or too short',
      description: 'We extracted very little text from your document.',
      suggestion: 'Try uploading a text-based PDF or DOCX file, or use the text input option instead.'
    });
    score -= 40; // Reduced penalty
  } else if (documentType === 'cv' && wordCount < 75) { // Lowered threshold from 100 to 75
    issues.push({
      type: 'warning',
      title: 'CV seems quite short',
      description: `We extracted ${wordCount} words, which is shorter than typical CVs.`,
      suggestion: 'Ensure your CV includes all relevant sections like experience, education, and skills.'
    });
    score -= 10; // Reduced penalty from 20 to 10
  } else if (documentType === 'job_description' && wordCount < 50) {
    issues.push({
      type: 'warning',
      title: 'Job description seems short',
      description: `We extracted ${wordCount} words, which may not include all job requirements.`,
      suggestion: 'Make sure to include the complete job description with requirements and responsibilities.'
    });
    score -= 10; // Reduced penalty from 15 to 10
  }

  // Check for potential extraction issues - much more lenient
  // Allow common professional formatting characters: bullets (•), em-dashes (—), smart quotes, etc.
  const hasGarbledText = /[^\w\s\-.,;:()!?'"@#$%&*+=<>{}[\]|\\\/~`•–—""''…°]+/.test(extractedText);
  if (hasGarbledText) {
    // Only flag if there are truly problematic characters
    const problematicChars = extractedText.match(/[^\w\s\-.,;:()!?'"@#$%&*+=<>{}[\]|\\\/~`•–—""''…°]+/g);
    if (problematicChars && problematicChars.length > 3) { // Only flag if many issues
      issues.push({
        type: 'warning',
        title: 'Some formatting may need review',
        description: 'A few characters may not have extracted perfectly.',
        suggestion: 'Review the extracted text and make any necessary corrections.'
      });
      score -= 8; // Much reduced penalty from 25 to 8
    }
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
    score -= 15; // Reduced penalty from 30 to 15
  }

  // Check for CV sections with expanded keywords and less harsh penalties
  if (documentType === 'cv' && wordCount > 50) {
    const lowerText = extractedText.toLowerCase();
    const hasEmail = /@/.test(extractedText);
    
    // Expanded experience keywords
    const hasExperience = /experience|work|employment|job|position|role|career|professional|responsibilities|achievements|accomplishments|worked|employed|managed|led|developed|created/.test(lowerText);
    
    // Expanded education keywords  
    const hasEducation = /education|university|college|degree|school|qualification|diploma|certificate|studied|graduated|bachelor|master|phd|training|course/.test(lowerText);
    
    // Positive scoring for good structure
    let structureBonus = 0;
    if (hasEmail) structureBonus += 2;
    if (hasExperience) structureBonus += 3;
    if (hasEducation) structureBonus += 2;
    score += structureBonus;
    
    // Less harsh penalties for missing sections
    if (!hasEmail) {
      issues.push({
        type: 'info',
        title: 'Contact information not clearly visible',
        description: 'We couldn\'t find an email address in your CV.',
        suggestion: 'Ensure your contact details are clearly visible and not in headers/footers.'
      });
      score -= 2; // Reduced from 5 to 2
    }
    
    if (!hasExperience) {
      issues.push({
        type: 'info',
        title: 'Experience section could be clearer',
        description: 'We couldn\'t clearly identify work experience keywords.',
        suggestion: 'Consider using standard headings like "Experience", "Work History", or "Career".'
      });
      score -= 3; // Reduced from 10 to 3
    }
    
    if (!hasEducation) {
      issues.push({
        type: 'info',
        title: 'Education section could be clearer',
        description: 'We couldn\'t clearly identify education keywords.',
        suggestion: 'Consider using standard headings like "Education", "Qualifications", or "Training".'
      });
      score -= 2; // Reduced from 5 to 2
    }
  }

  // Add positive feedback for well-structured documents
  if (documentType === 'cv' && wordCount >= 150 && wordCount <= 800) {
    score += 5;
    issues.unshift({
      type: 'info',
      title: 'Well-structured document length',
      description: `Your CV has ${wordCount} words, which is in the optimal range.`,
      suggestion: 'Great job maintaining a comprehensive yet concise format!',
    });
  }

  // Positive indicators for excellent documents
  if (score >= 90 && issues.filter(i => i.type !== 'info').length === 0) {
    issues.unshift({
      type: 'info',
      title: 'Excellent document quality!',
      description: `Successfully extracted ${wordCount} words with clear formatting and structure.`,
      suggestion: 'Your document is ready for high-quality analysis.',
    });
  } else if (issues.filter(i => i.type === 'error').length === 0 && wordCount >= 50) {
    issues.push({
      type: 'info',
      title: 'Good extraction quality',
      description: `Successfully extracted ${wordCount} words from your document.`,
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
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Acceptable';
  return 'Needs Improvement';
};