// Simple document structure for CV processing (no complex formatting needed)
export interface SimpleDocumentStructure {
  content: string;
  wordCount: number;
  lineCount: number;
  hasHeadings: boolean;
  hasBulletPoints: boolean;
}

// Simple text analysis for CV uploads - no complex JSON needed
export const analyzeSimpleDocument = (text: string): SimpleDocumentStructure => {
  const lines = text.split('\n').filter(line => line.trim());
  const words = text.split(/\s+/).filter(word => word.trim());
  
  const hasHeadings = lines.some(line => 
    line.trim().match(/^#{1,3}\s+/) || 
    line.trim().match(/^[A-Z\s]{3,}$/) ||
    line.trim().endsWith(':')
  );
  
  const hasBulletPoints = lines.some(line => 
    line.trim().match(/^[-•*]\s+/) ||
    line.trim().match(/^\d+\.\s+/)
  );
  
  return {
    content: text,
    wordCount: words.length,
    lineCount: lines.length,
    hasHeadings,
    hasBulletPoints
  };
};

// Extract key sections from CV text without complex parsing
export const extractCVSections = (text: string): Record<string, string> => {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
  
  let currentSection = 'general';
  let currentContent: string[] = [];
  
  const commonSectionHeaders = [
    'experience', 'education', 'skills', 'summary', 'objective',
    'work', 'employment', 'qualifications', 'achievements', 'projects',
    'certifications', 'languages', 'interests', 'references'
  ];
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    // Check if this line is a section header
    const isHeader = commonSectionHeaders.some(header => 
      trimmed.includes(header) && 
      (trimmed.length < 50) && // Headers are usually short
      (line.trim().endsWith(':') || line.trim().match(/^[A-Z\s]{3,}$/))
    );
    
    if (isHeader) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Start new section
      currentSection = commonSectionHeaders.find(header => trimmed.includes(header)) || 'general';
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(line);
    }
  }
  
  // Save final section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
};