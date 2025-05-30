import { extractCompanyFromText } from '@/utils/analysisUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const performComprehensiveAnalysis = async (
  cvUpload: any,
  jobUpload: any,
  finalJobTitle: string,
  extractedCompany: string,
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
  userId: string
) => {
  const cvText = uploadedFiles.cv!.extractedText.toLowerCase();
  const jobText = uploadedFiles.jobDescription!.extractedText.toLowerCase();

  // Enhanced keyword extraction - more comprehensive
  const jobWords = jobText.split(/\W+/).filter(word => word.length > 2);
  
  // Create more comprehensive keyword list including technical terms, skills, and industry keywords
  const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'way', 'many', 'than', 'them', 'well', 'were', 'will', 'with', 'have', 'this', 'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
  
  const keyTerms = [...new Set(jobWords)]
    .filter(word => !commonWords.includes(word) && word.length > 2);

  // More sophisticated matching with variations
  const matchingTerms = keyTerms.filter(term => {
    const termVariations = [
      term, 
      term + 's', 
      term + 'ing', 
      term + 'ed', 
      term + 'er',
      term + 'ly',
      term.replace('ing', ''),
      term.replace('ed', ''),
      term.replace('s', '')
    ];
    return termVariations.some(variation => cvText.includes(variation));
  });

  const missingTerms = keyTerms.filter(term => {
    const termVariations = [
      term, 
      term + 's', 
      term + 'ing', 
      term + 'ed', 
      term + 'er',
      term + 'ly',
      term.replace('ing', ''),
      term.replace('ed', ''),
      term.replace('s', '')
    ];
    return !termVariations.some(variation => cvText.includes(variation));
  });

  // Enhanced scoring algorithm
  const baseScore = Math.round((matchingTerms.length / keyTerms.length) * 100);
  
  // Bonus points for key skills and experience indicators
  let bonusScore = 0;
  const experienceKeywords = ['years', 'experience', 'senior', 'lead', 'manager', 'director'];
  const skillKeywords = ['skill', 'proficient', 'expert', 'advanced', 'certified'];
  
  experienceKeywords.forEach(keyword => {
    if (cvText.includes(keyword)) bonusScore += 2;
  });
  
  skillKeywords.forEach(keyword => {
    if (cvText.includes(keyword)) bonusScore += 3;
  });

  const compatibilityScore = Math.min(100, baseScore + bonusScore);

  // Format job title properly
  const formattedJobTitle = finalJobTitle.replace(/^for:\s*/i, '').trim();

  return {
    user_id: userId,
    cv_upload_id: cvUpload.id,
    job_description_upload_id: jobUpload.id,
    job_title: formattedJobTitle,
    company_name: extractedCompany,
    compatibility_score: compatibilityScore,
    keywords_found: matchingTerms,
    keywords_missing: missingTerms,
    strengths: generateEnhancedStrengths(matchingTerms, compatibilityScore, cvText),
    weaknesses: generateEnhancedWeaknesses(missingTerms, compatibilityScore, cvText),
    recommendations: generateEnhancedRecommendations(missingTerms, compatibilityScore, formattedJobTitle),
    executive_summary: generateEnhancedExecutiveSummary(compatibilityScore, formattedJobTitle, matchingTerms.length, missingTerms.length)
  };
};

export const generateEnhancedStrengths = (matchingTerms: string[], score: number, cvText: string): string[] => {
  const strengths = [];
  
  if (score >= 80) strengths.push('Excellent alignment with job requirements and strong keyword coverage');
  else if (score >= 70) strengths.push('Strong keyword alignment with job requirements');
  else if (score >= 60) strengths.push('Good foundation with relevant skills and experience');
  
  if (matchingTerms.length >= 20) strengths.push('Comprehensive technical skill coverage matching job needs');
  else if (matchingTerms.length >= 10) strengths.push('Good technical skill coverage');
  else if (matchingTerms.length >= 5) strengths.push('Basic technical skill alignment');
  
  if (cvText.includes('years') || cvText.includes('experience')) {
    strengths.push('Clear demonstration of relevant professional experience');
  }
  
  if (cvText.includes('lead') || cvText.includes('manage') || cvText.includes('senior')) {
    strengths.push('Leadership and senior-level experience highlighted');
  }

  if (cvText.includes('project') || cvText.includes('initiative')) {
    strengths.push('Project management and initiative leadership experience');
  }

  if (cvText.includes('team') || cvText.includes('collaborate')) {
    strengths.push('Strong teamwork and collaboration skills demonstrated');
  }
  
  return strengths.slice(0, 6);
};

export const generateEnhancedWeaknesses = (missingTerms: string[], score: number, cvText: string): string[] => {
  const weaknesses = [];
  
  if (score < 40) weaknesses.push('Significant gap in keyword alignment with job requirements');
  else if (score < 60) weaknesses.push('Moderate keyword gap that could be improved');
  
  if (missingTerms.length >= 30) weaknesses.push('Multiple key technical skills and requirements not clearly addressed');
  else if (missingTerms.length >= 20) weaknesses.push('Several important skills and requirements missing from CV');
  else if (missingTerms.length >= 10) weaknesses.push('Some key skills and requirements could be better highlighted');
  
  if (!cvText.includes('achieve') && !cvText.includes('result') && !cvText.includes('impact')) {
    weaknesses.push('Limited quantifiable achievements and results mentioned');
  }
  
  if (missingTerms.some(term => ['certification', 'certified', 'training'].includes(term))) {
    weaknesses.push('Relevant certifications and professional development not highlighted');
  }

  if (!cvText.includes('leadership') && !cvText.includes('manage') && !cvText.includes('lead')) {
    weaknesses.push('Leadership experience could be better emphasized');
  }

  if (!cvText.includes('innovation') && !cvText.includes('improve')) {
    weaknesses.push('Innovation and improvement initiatives not clearly demonstrated');
  }
  
  return weaknesses.slice(0, 6);
};

export const generateEnhancedRecommendations = (missingTerms: string[], score: number, jobTitle: string): string[] => {
  const recommendations = [];
  
  if (score < 70) {
    recommendations.push('Incorporate more specific keywords and phrases from the job description throughout your CV');
  }
  
  if (missingTerms.length >= 15) {
    const topMissing = missingTerms.slice(0, 6);
    recommendations.push(`Highlight experience with key missing skills: ${topMissing.join(', ')}`);
  }
  
  recommendations.push('Add quantifiable achievements and specific examples that demonstrate your impact in previous roles');
  recommendations.push('Tailor your professional summary to better align with the specific requirements of this position');
  recommendations.push('Consider adding a comprehensive skills section that directly mirrors the job requirements');
  
  if (missingTerms.some(term => ['agile', 'scrum', 'project management'].includes(term))) {
    recommendations.push('Include project management methodologies and frameworks you have experience with');
  }

  if (missingTerms.some(term => ['cloud', 'digital', 'technology'].includes(term))) {
    recommendations.push('Emphasize digital transformation and technology experience relevant to the role');
  }

  recommendations.push('Optimize CV formatting and structure for ATS compatibility and keyword scanning');
  
  return recommendations.slice(0, 8);
};

export const generateEnhancedExecutiveSummary = (score: number, jobTitle: string, matchingCount: number, missingCount: number): string => {
  let matchLevel = '';
  let context = '';
  
  if (score >= 80) {
    matchLevel = 'excellent';
    context = 'Your CV demonstrates strong qualifications and alignment';
  } else if (score >= 70) {
    matchLevel = 'good';
    context = 'Your CV shows solid potential for this role';
  } else if (score >= 50) {
    matchLevel = 'moderate to good';
    context = 'Your CV has a reasonable foundation but needs enhancement';
  } else {
    matchLevel = 'limited';
    context = 'Your CV requires significant improvements to match this role';
  }
  
  return `Your CV demonstrates ${matchLevel} compatibility (${score}%) with the ${jobTitle} position. ${context} with ${matchingCount} relevant keywords found and ${missingCount} key areas for improvement identified. Focus on strengthening the highlighted areas and incorporating missing keywords to enhance your application's effectiveness and ATS compatibility.`;
};
