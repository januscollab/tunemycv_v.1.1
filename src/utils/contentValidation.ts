
export interface CVContentAnalysis {
  companyExperience: Array<{
    company: string;
    industry: string;
    yearsEstimate: number;
    context: string;
  }>;
  skillsIdentified: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  industryExposure: string[];
  keywordsFound: string[];
  totalExperienceYears: number;
}

export interface ValidationResult {
  contentAnalysis: CVContentAnalysis;
  qualityFlags: string[];
  confidenceScore: number;
}

// Extract company experience from CV text
export const extractCompanyExperience = (cvText: string): Array<{
  company: string;
  industry: string;
  yearsEstimate: number;
  context: string;
}> => {
  const companies = [];
  const lines = cvText.split('\n');
  
  // Look for common company patterns
  const companyPatterns = [
    /(?:at|with)\s+([A-Z][a-zA-Z\s&]+(?:Inc|Corp|Ltd|LLC|Company|Group|Solutions|Technologies|Systems|Telecom|Communications))/gi,
    /^([A-Z][a-zA-Z\s&]+(?:Inc|Corp|Ltd|LLC|Company|Group|Solutions|Technologies|Systems|Telecom|Communications))/gm
  ];

  for (const pattern of companyPatterns) {
    let match;
    while ((match = pattern.exec(cvText)) !== null) {
      const companyName = match[1].trim();
      const context = cvText.substring(Math.max(0, match.index - 50), match.index + 100);
      
      // Estimate years based on date patterns near company mentions
      const yearPattern = /(?:20\d{2}|19\d{2})/g;
      const years = context.match(yearPattern) || [];
      const yearsEstimate = years.length >= 2 ? 
        Math.abs(parseInt(years[1]) - parseInt(years[0])) : 1;

      // Simple industry classification
      let industry = 'General';
      if (companyName.toLowerCase().includes('telecom') || companyName.toLowerCase().includes('communication')) {
        industry = 'Telecommunications';
      } else if (companyName.toLowerCase().includes('tech') || companyName.toLowerCase().includes('software')) {
        industry = 'Technology';
      }

      companies.push({
        company: companyName,
        industry,
        yearsEstimate,
        context: context.trim()
      });
    }
  }

  return companies.slice(0, 10); // Limit to top 10 companies
};

// Analyze CV content for validation
export const analyzeCVContent = (cvText: string): CVContentAnalysis => {
  const lowerText = cvText.toLowerCase();
  
  // Extract company experience
  const companyExperience = extractCompanyExperience(cvText);
  
  // Calculate total experience years
  const totalExperienceYears = companyExperience.reduce((sum, exp) => sum + exp.yearsEstimate, 0);
  
  // Determine experience level
  let experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' = 'entry';
  if (totalExperienceYears >= 15 || lowerText.includes('director') || lowerText.includes('executive')) {
    experienceLevel = 'executive';
  } else if (totalExperienceYears >= 8 || lowerText.includes('senior') || lowerText.includes('lead')) {
    experienceLevel = 'senior';
  } else if (totalExperienceYears >= 3) {
    experienceLevel = 'mid';
  }

  // Extract skills
  const skillsPatterns = [
    /(?:skills?|technologies?|expertise)[:]\s*([^.\n]+)/gi,
    /(?:proficient|experienced|expert)\s+(?:in|with)\s+([^.\n]+)/gi
  ];
  
  const skillsIdentified = [];
  for (const pattern of skillsPatterns) {
    let match;
    while ((match = pattern.exec(cvText)) !== null) {
      const skills = match[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
      skillsIdentified.push(...skills);
    }
  }

  // Industry exposure analysis
  const industryKeywords = {
    'Telecommunications': ['telecom', 'mobile', '5g', '4g', 'network', 'wireless', 'cellular', 'voip'],
    'Technology': ['software', 'programming', 'development', 'coding', 'database', 'cloud', 'api'],
    'Healthcare': ['medical', 'healthcare', 'hospital', 'clinical', 'patient'],
    'Finance': ['banking', 'financial', 'investment', 'trading', 'fintech', 'payments']
  };

  const industryExposure = [];
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    if (matches.length >= 2) {
      industryExposure.push(industry);
    }
  }

  // Extract key terms for matching
  const keywordsFound = lowerText.split(/\W+/).filter(word => word.length > 3);

  return {
    companyExperience,
    skillsIdentified: [...new Set(skillsIdentified)].slice(0, 20),
    experienceLevel,
    industryExposure,
    keywordsFound: [...new Set(keywordsFound)].slice(0, 50),
    totalExperienceYears
  };
};

// Validate analysis results for contradictions
export const validateAnalysisResult = (analysisResult: any, cvAnalysis: CVContentAnalysis): ValidationResult => {
  const qualityFlags = [];
  let confidenceScore = 100;

  // Check for contradictions with industry experience
  if (analysisResult.executiveSummary?.weaknesses) {
    for (const weakness of analysisResult.executiveSummary.weaknesses) {
      const weaknessText = (weakness.title || weakness.description || '').toLowerCase();
      
      // Flag if claiming lack of industry experience when CV shows relevant industry
      for (const industry of cvAnalysis.industryExposure) {
        if (weaknessText.includes(`lacks ${industry.toLowerCase()}`) || 
            weaknessText.includes(`limited ${industry.toLowerCase()}`)) {
          qualityFlags.push(`Contradiction: Claims lack of ${industry} experience despite CV evidence`);
          confidenceScore -= 20;
        }
      }
      
      // Flag generic advice
      const genericPhrases = ['take courses', 'attend conferences', 'consider training', 'enroll in programs'];
      for (const phrase of genericPhrases) {
        if (weaknessText.includes(phrase)) {
          qualityFlags.push(`Generic advice detected: "${phrase}"`);
          confidenceScore -= 10;
        }
      }
    }
  }

  // Check if experience level assessment is reasonable
  if (analysisResult.compatibilityScore !== undefined) {
    const scoreVsExperience = analysisResult.compatibilityScore;
    if (cvAnalysis.experienceLevel === 'senior' && scoreVsExperience < 40) {
      qualityFlags.push('Low score despite senior experience level - may indicate analysis error');
      confidenceScore -= 15;
    }
  }

  // Check for evidence backing
  if (analysisResult.executiveSummary?.strengths) {
    let strengthsWithEvidence = 0;
    for (const strength of analysisResult.executiveSummary.strengths) {
      if (strength.evidence && strength.evidence.length > 10) {
        strengthsWithEvidence++;
      }
    }
    if (strengthsWithEvidence === 0) {
      qualityFlags.push('No evidence provided for claimed strengths');
      confidenceScore -= 25;
    }
  }

  return {
    contentAnalysis: cvAnalysis,
    qualityFlags,
    confidenceScore: Math.max(0, confidenceScore)
  };
};
