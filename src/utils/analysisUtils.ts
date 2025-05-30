
export const extractJobTitleFromText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for common job title patterns
  for (const line of lines.slice(0, 15)) {
    const trimmedLine = line.trim();
    
    // Skip extracted text indicators
    if (trimmedLine.includes('[Extracted text from') || trimmedLine.includes('.docx]') || trimmedLine.includes('.pdf]')) {
      continue;
    }
    
    // Look for job title indicators
    if (trimmedLine.toLowerCase().includes('position:') || 
        trimmedLine.toLowerCase().includes('job title:') || 
        trimmedLine.toLowerCase().includes('role:')) {
      const titlePart = trimmedLine.split(':')[1]?.trim();
      if (titlePart && titlePart.length > 3) {
        return titlePart;
      }
    }
    
    // Look for lines that seem like job titles (common patterns)
    if (trimmedLine.length > 5 && trimmedLine.length < 100 && 
        !trimmedLine.includes('http') && 
        !trimmedLine.includes('@') &&
        !trimmedLine.includes('Company') &&
        !trimmedLine.toLowerCase().includes('description') &&
        (trimmedLine.toLowerCase().includes('engineer') || 
         trimmedLine.toLowerCase().includes('manager') || 
         trimmedLine.toLowerCase().includes('director') || 
         trimmedLine.toLowerCase().includes('analyst') || 
         trimmedLine.toLowerCase().includes('specialist') || 
         trimmedLine.toLowerCase().includes('coordinator') || 
         trimmedLine.toLowerCase().includes('lead') ||
         trimmedLine.toLowerCase().includes('senior') ||
         trimmedLine.toLowerCase().includes('junior'))) {
      return trimmedLine;
    }
  }
  
  // If no clear job title found, return the first substantial line
  for (const line of lines.slice(0, 5)) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 5 && trimmedLine.length < 100 && 
        !trimmedLine.includes('[Extracted text from') &&
        !trimmedLine.includes('.docx]') && 
        !trimmedLine.includes('.pdf]')) {
      return trimmedLine;
    }
  }
  
  return 'Position';
};

export const extractCompanyFromText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines.slice(0, 10)) {
    const trimmedLine = line.trim();
    
    // Skip extracted text indicators
    if (trimmedLine.includes('[Extracted text from') || trimmedLine.includes('.docx]') || trimmedLine.includes('.pdf]')) {
      continue;
    }
    
    // Look for company name indicators
    if (trimmedLine.toLowerCase().includes('company:') || 
        trimmedLine.toLowerCase().includes('organization:') || 
        trimmedLine.toLowerCase().includes('employer:')) {
      const companyPart = trimmedLine.split(':')[1]?.trim();
      if (companyPart && companyPart.length > 2) {
        return companyPart;
      }
    }
    
    // Look for common company suffixes
    if (trimmedLine.toLowerCase().includes('inc') ||
        trimmedLine.toLowerCase().includes('ltd') ||
        trimmedLine.toLowerCase().includes('llc') ||
        trimmedLine.toLowerCase().includes('corporation') ||
        trimmedLine.toLowerCase().includes('corp') ||
        trimmedLine.toLowerCase().includes('group') ||
        trimmedLine.toLowerCase().includes('solutions') ||
        trimmedLine.toLowerCase().includes('technologies') ||
        trimmedLine.toLowerCase().includes('systems')) {
      return trimmedLine;
    }
  }
  
  // Look for lines that might be company names (short, not too descriptive)
  for (const line of lines.slice(0, 8)) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 2 && trimmedLine.length < 50 && 
        !trimmedLine.includes('[Extracted text from') &&
        !trimmedLine.includes('.docx]') && 
        !trimmedLine.includes('.pdf]') &&
        !trimmedLine.toLowerCase().includes('position') &&
        !trimmedLine.toLowerCase().includes('job') &&
        !trimmedLine.toLowerCase().includes('description') &&
        !trimmedLine.toLowerCase().includes('requirements') &&
        !trimmedLine.toLowerCase().includes('responsibilities')) {
      return trimmedLine;
    }
  }
  
  return 'Company';
};

export const generateStrengths = (matchingTerms: string[], score: number): string[] => {
  const strengths = [];
  if (score >= 70) strengths.push('Strong keyword alignment with job requirements');
  if (matchingTerms.length >= 5) strengths.push('Good technical skill coverage');
  if (score >= 60) strengths.push('Relevant experience highlighted');
  return strengths.slice(0, 3);
};

export const generateWeaknesses = (missingTerms: string[], score: number): string[] => {
  const weaknesses = [];
  if (score < 50) weaknesses.push('Low keyword match with job requirements');
  if (missingTerms.length >= 10) weaknesses.push('Missing key technical skills');
  if (score < 30) weaknesses.push('Limited alignment with job description');
  return weaknesses.slice(0, 3);
};

export const generateRecommendations = (missingTerms: string[], score: number): string[] => {
  const recommendations = [];
  if (score < 70) recommendations.push('Include more relevant keywords from the job description');
  if (missingTerms.length >= 5) recommendations.push(`Consider adding experience with: ${missingTerms.slice(0, 3).join(', ')}`);
  recommendations.push('Tailor your CV more specifically to this role');
  return recommendations.slice(0, 3);
};

export const generateExecutiveSummary = (score: number, jobTitle: string): string => {
  if (score >= 70) {
    return `Your CV shows strong alignment with the ${jobTitle} position. You have good keyword coverage and relevant experience that matches the job requirements.`;
  } else if (score >= 40) {
    return `Your CV has moderate alignment with the ${jobTitle} position. There are areas for improvement to better match the job requirements.`;
  } else {
    return `Your CV currently has limited alignment with the ${jobTitle} position. Significant improvements are needed to match the job requirements.`;
  }
};
