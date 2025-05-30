
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText, generateStrengths, generateWeaknesses, generateRecommendations, generateExecutiveSummary } from '@/utils/analysisUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const performAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useAI: boolean,
    userCredits: any
  ) => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      toast({ title: 'Error', description: 'Please upload both CV and job description', variant: 'destructive' });
      return;
    }

    try {
      setAnalyzing(true);
      console.log('Starting CV analysis...');

      const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
      const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

      // Save files to database first
      console.log('Saving files to database...');
      const { data: cvUpload, error: cvError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.cv.file.name,
          file_type: uploadedFiles.cv.file.type,
          file_size: uploadedFiles.cv.file.size,
          upload_type: 'cv',
          extracted_text: uploadedFiles.cv.extractedText,
          job_title: finalJobTitle
        })
        .select()
        .single();

      if (cvError) {
        console.error('CV upload error:', cvError);
        throw cvError;
      }

      const { data: jobUpload, error: jobError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.jobDescription.file.name,
          file_type: uploadedFiles.jobDescription.file.type,
          file_size: uploadedFiles.jobDescription.file.size,
          upload_type: 'job_description',
          extracted_text: uploadedFiles.jobDescription.extractedText,
          job_title: finalJobTitle
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job description upload error:', jobError);
        throw jobError;
      }

      console.log('Files uploaded successfully, starting analysis...');

      let analysisData;
      const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

      // Always try AI analysis if user has credits
      if (hasCreditsForAI) {
        try {
          console.log('Attempting comprehensive AI analysis...');
          const { data: aiResult, error: aiError } = await supabase.functions.invoke('analyze-cv-with-ai', {
            body: {
              cvText: uploadedFiles.cv.extractedText,
              jobDescriptionText: uploadedFiles.jobDescription.extractedText,
              jobTitle: finalJobTitle,
              userId: user?.id
            }
          });

          console.log('AI analysis response:', aiResult);

          if (aiError) {
            console.error('AI analysis error:', aiError);
            throw aiError;
          }

          if (aiResult?.success && aiResult?.analysis) {
            console.log('AI analysis successful');
            const aiAnalysis = aiResult.analysis;
            
            analysisData = {
              user_id: user?.id,
              cv_upload_id: cvUpload.id,
              job_description_upload_id: jobUpload.id,
              job_title: finalJobTitle,
              company_name: extractedCompany,
              compatibility_score: aiAnalysis.compatibilityScore,
              keywords_found: aiAnalysis.keywordsFound,
              keywords_missing: aiAnalysis.keywordsMissing,
              strengths: aiAnalysis.strengths,
              weaknesses: aiAnalysis.weaknesses,
              recommendations: aiAnalysis.recommendations,
              executive_summary: aiAnalysis.executiveSummary
            };

            toast({ 
              title: 'Analysis Complete!', 
              description: `Comprehensive analysis completed. ${aiResult.creditsRemaining || 0} credits remaining.` 
            });
          } else {
            throw new Error('AI analysis returned invalid results');
          }
        } catch (aiError) {
          console.error('AI analysis failed, falling back to comprehensive analysis:', aiError);
          
          // Fall back to comprehensive local analysis
          analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles);
          
          toast({ 
            title: 'Analysis Complete!', 
            description: 'Comprehensive analysis completed using advanced algorithms.'
          });
        }
      } else {
        console.log('No credits available, using comprehensive analysis');
        
        // Use comprehensive local analysis
        analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles);
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }

      // Save analysis results
      console.log('Saving analysis results to database...');
      const { data: analysisResult, error: analysisError } = await supabase
        .from('analysis_results')
        .insert(analysisData)
        .select()
        .single();

      if (analysisError) {
        console.error('Analysis save error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis completed successfully:', analysisResult);
      setAnalysisResult(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Error', description: 'Failed to analyze CV. Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const performComprehensiveAnalysis = async (cvUpload: any, jobUpload: any, finalJobTitle: string, extractedCompany: string, uploadedFiles: any) => {
    const cvText = uploadedFiles.cv!.extractedText.toLowerCase();
    const jobText = uploadedFiles.jobDescription!.extractedText.toLowerCase();

    // Enhanced keyword extraction
    const jobWords = jobText.split(/\W+/).filter(word => word.length > 3);
    const keyTerms = [...new Set(jobWords)] as string[];

    // More sophisticated matching
    const matchingTerms = keyTerms.filter(term => {
      const termVariations = [term, term + 's', term + 'ing', term + 'ed'];
      return termVariations.some(variation => cvText.includes(variation));
    });

    const missingTerms = keyTerms.filter(term => {
      const termVariations = [term, term + 's', term + 'ing', term + 'ed'];
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

    return {
      user_id: user?.id,
      cv_upload_id: cvUpload.id,
      job_description_upload_id: jobUpload.id,
      job_title: finalJobTitle,
      company_name: extractedCompany,
      compatibility_score: compatibilityScore,
      keywords_found: matchingTerms.slice(0, 15),
      keywords_missing: missingTerms.slice(0, 15),
      strengths: generateEnhancedStrengths(matchingTerms, compatibilityScore, cvText),
      weaknesses: generateEnhancedWeaknesses(missingTerms, compatibilityScore, cvText),
      recommendations: generateEnhancedRecommendations(missingTerms, compatibilityScore, finalJobTitle),
      executive_summary: generateEnhancedExecutiveSummary(compatibilityScore, finalJobTitle, matchingTerms.length, missingTerms.length)
    };
  };

  const generateEnhancedStrengths = (matchingTerms: string[], score: number, cvText: string): string[] => {
    const strengths = [];
    
    if (score >= 80) strengths.push('Excellent alignment with job requirements and strong keyword coverage');
    else if (score >= 70) strengths.push('Strong keyword alignment with job requirements');
    else if (score >= 60) strengths.push('Good foundation with relevant skills and experience');
    
    if (matchingTerms.length >= 10) strengths.push('Comprehensive technical skill coverage matching job needs');
    else if (matchingTerms.length >= 5) strengths.push('Good technical skill coverage');
    
    if (cvText.includes('years') || cvText.includes('experience')) {
      strengths.push('Clear demonstration of relevant professional experience');
    }
    
    if (cvText.includes('lead') || cvText.includes('manage') || cvText.includes('senior')) {
      strengths.push('Leadership and senior-level experience highlighted');
    }
    
    return strengths.slice(0, 4);
  };

  const generateEnhancedWeaknesses = (missingTerms: string[], score: number, cvText: string): string[] => {
    const weaknesses = [];
    
    if (score < 40) weaknesses.push('Significant gap in keyword alignment with job requirements');
    else if (score < 60) weaknesses.push('Moderate keyword gap that could be improved');
    
    if (missingTerms.length >= 15) weaknesses.push('Multiple key technical skills and requirements not clearly addressed');
    else if (missingTerms.length >= 10) weaknesses.push('Several important skills and requirements missing from CV');
    
    if (!cvText.includes('achieve') && !cvText.includes('result') && !cvText.includes('impact')) {
      weaknesses.push('Limited quantifiable achievements and results mentioned');
    }
    
    if (missingTerms.some(term => ['certification', 'certified', 'training'].includes(term))) {
      weaknesses.push('Relevant certifications and professional development not highlighted');
    }
    
    return weaknesses.slice(0, 4);
  };

  const generateEnhancedRecommendations = (missingTerms: string[], score: number, jobTitle: string): string[] => {
    const recommendations = [];
    
    if (score < 70) {
      recommendations.push('Incorporate more specific keywords and phrases from the job description throughout your CV');
    }
    
    if (missingTerms.length >= 8) {
      const topMissing = missingTerms.slice(0, 4);
      recommendations.push(`Highlight experience with key missing skills: ${topMissing.join(', ')}`);
    }
    
    recommendations.push('Add quantifiable achievements and specific examples that demonstrate your impact in previous roles');
    recommendations.push('Tailor your professional summary to better align with the specific requirements of this position');
    recommendations.push('Consider adding a skills section that directly mirrors the job requirements');
    
    if (missingTerms.some(term => ['agile', 'scrum', 'project management'].includes(term))) {
      recommendations.push('Include project management methodologies and frameworks you have experience with');
    }
    
    return recommendations.slice(0, 5);
  };

  const generateEnhancedExecutiveSummary = (score: number, jobTitle: string, matchingCount: number, missingCount: number): string => {
    let matchLevel = '';
    let context = '';
    
    if (score >= 80) {
      matchLevel = 'excellent';
      context = 'Your CV demonstrates strong qualifications and alignment';
    } else if (score >= 70) {
      matchLevel = 'good';
      context = 'Your CV shows solid potential for this role';
    } else if (score >= 50) {
      matchLevel = 'moderate';
      context = 'Your CV has a reasonable foundation but needs enhancement';
    } else {
      matchLevel = 'limited';
      context = 'Your CV requires significant improvements to match this role';
    }
    
    return `Your CV demonstrates ${matchLevel} compatibility (${score}%) with the ${jobTitle} position. ${context} with ${matchingCount} relevant keywords found and ${missingCount} key areas for improvement identified. Focus on strengthening the highlighted areas to enhance your application's effectiveness.`;
  };

  return {
    analyzing,
    analysisResult,
    setAnalysisResult,
    performAnalysis
  };
};
