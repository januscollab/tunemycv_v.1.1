
export const extractJobTitleFromText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  for (const line of lines.slice(0, 10)) {
    if (line.toLowerCase().includes('position') || 
        line.toLowerCase().includes('role') || 
        line.toLowerCase().includes('job title')) {
      return line.trim();
    }
  }
  return lines[0]?.trim() || 'Position';
};

export const extractCompanyFromText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  for (const line of lines.slice(0, 5)) {
    if (line.toLowerCase().includes('company') || 
        line.toLowerCase().includes('corporation') || 
        line.toLowerCase().includes('inc') ||
        line.toLowerCase().includes('ltd')) {
      return line.trim();
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
