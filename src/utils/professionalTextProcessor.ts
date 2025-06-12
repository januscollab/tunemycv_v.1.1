import nlp from 'compromise';

// Professional text preprocessing for better JSON structure
export class ProfessionalTextProcessor {
  
  // Clean and normalize text content
  static normalizeText(text: string): string {
    console.log('[ProfessionalTextProcessor] Starting text normalization');
    
    return text
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€¢/g, '•')
      // Normalize various bullet characters
      .replace(/[•·‣⁃]/g, '• ')
      // Clean up excessive whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Fix common formatting issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/(\w)([0-9])/g, '$1 $2') // Add space between word and number
      .trim();
  }

  // Intelligent CV section detection and structuring
  static structureCVContent(text: string): {
    sections: Array<{
      title: string;
      content: string;
      type: 'header' | 'paragraph' | 'list';
      confidence: number;
    }>;
    quality: number;
  } {
    console.log('[ProfessionalTextProcessor] Analyzing CV structure');
    
    const doc = nlp(text);
    const sentences = doc.sentences().out('array');
    const sections: Array<{
      title: string;
      content: string;
      type: 'header' | 'paragraph' | 'list';
      confidence: number;
    }> = [];

    // Common CV section patterns with higher confidence
    const cvSectionPatterns = [
      { pattern: /^(professional\s+summary|summary|profile|objective)/i, confidence: 0.95 },
      { pattern: /^(work\s+experience|experience|employment|career\s+history)/i, confidence: 0.98 },
      { pattern: /^(education|qualifications|academic\s+background)/i, confidence: 0.95 },
      { pattern: /^(skills|technical\s+skills|core\s+competencies|expertise)/i, confidence: 0.92 },
      { pattern: /^(achievements|accomplishments|awards)/i, confidence: 0.85 },
      { pattern: /^(certifications?|licenses?|professional\s+development)/i, confidence: 0.88 },
      { pattern: /^(projects?|portfolio|key\s+projects)/i, confidence: 0.85 },
      { pattern: /^(contact|personal\s+details|references)/i, confidence: 0.90 }
    ];

    const lines = text.split('\n').filter(line => line.trim());
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this line is a section header
      const matchedPattern = cvSectionPatterns.find(({ pattern }) => pattern.test(trimmed));
      
      if (matchedPattern || this.isLikelyHeader(trimmed)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          const content = currentContent.join('\n').trim();
          sections.push({
            title: currentSection,
            content,
            type: this.detectContentType(content),
            confidence: matchedPattern?.confidence || 0.7
          });
        }

        // Start new section
        currentSection = trimmed;
        currentContent = [];
      } else {
        // Add to current section content
        currentContent.push(trimmed);
      }
    }

    // Save final section
    if (currentSection && currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      sections.push({
        title: currentSection,
        content,
        type: this.detectContentType(content),
        confidence: 0.7
      });
    }

    const quality = this.calculateStructureQuality(sections);
    console.log('[ProfessionalTextProcessor] Structure analysis complete:', { sectionsCount: sections.length, quality });

    return { sections, quality };
  }

  // Detect if a line is likely a header
  private static isLikelyHeader(line: string): boolean {
    // Check for all caps (common in CVs)
    if (line.length > 3 && line === line.toUpperCase() && /^[A-Z\s&-]+$/.test(line)) {
      return true;
    }
    
    // Check for short lines without punctuation (likely headers)
    if (line.length < 50 && !line.includes('.') && !line.includes(',') && line.length > 3) {
      return true;
    }

    // Check for title case patterns
    const words = line.split(' ');
    const titleCaseCount = words.filter(word => /^[A-Z][a-z]+$/.test(word)).length;
    if (words.length > 1 && titleCaseCount / words.length > 0.6) {
      return true;
    }

    return false;
  }

  // Detect content type (paragraph vs list)
  private static detectContentType(content: string): 'header' | 'paragraph' | 'list' {
    const lines = content.split('\n');
    const bulletLines = lines.filter(line => /^[•\-*·]\s/.test(line.trim()));
    
    // If more than 50% are bullet points, it's a list
    if (bulletLines.length > lines.length * 0.5) {
      return 'list';
    }
    
    return 'paragraph';
  }

  // Calculate overall structure quality
  private static calculateStructureQuality(sections: Array<{ confidence: number }>): number {
    if (sections.length === 0) return 0;
    
    const avgConfidence = sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length;
    const structureBonus = Math.min(sections.length / 5, 1) * 0.2; // Bonus for having multiple sections
    
    return Math.min(avgConfidence + structureBonus, 1);
  }

  // Format JSON with proper beautification - SAFE FALLBACK ONLY
  static beautifyJSON(obj: any): string {
    try {
      // Simple, safe JSON formatting to prevent stack overflow
      console.log('[ProfessionalTextProcessor] Using safe JSON formatting');
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      console.error('[ProfessionalTextProcessor] Even safe JSON formatting failed:', error);
      return '{}'; // Ultimate fallback
    }
  }

  // Enhance paragraph structure for professional presentation
  static enhanceParagraphStructure(text: string): string {
    const doc = nlp(text);
    
    // Split into sentences and group logically
    const sentences = doc.sentences().out('array');
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    for (const sentence of sentences) {
      currentParagraph.push(sentence.trim());

      // Start new paragraph on topic shifts or after 3-4 sentences
      if (currentParagraph.length >= 3 || this.detectTopicShift(sentence)) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }

    // Add remaining sentences
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs.join('\n\n');
  }

  // Simple topic shift detection
  private static detectTopicShift(sentence: string): boolean {
    const transitionWords = [
      'however', 'furthermore', 'additionally', 'moreover', 'subsequently',
      'in addition', 'as a result', 'consequently', 'therefore'
    ];
    
    const lowerSentence = sentence.toLowerCase();
    return transitionWords.some(word => lowerSentence.includes(word));
  }

  // Clean and structure bullet points
  static structureBulletPoints(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove existing bullet characters and clean up
        const cleaned = line.replace(/^[•\-*·]\s*/, '').trim();
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      })
      .filter(item => item.length > 2); // Remove very short items
  }
}