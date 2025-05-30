
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

      // Save files to database first
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

      console.log('Files uploaded successfully, starting AI analysis...');

      let analysisData;
      const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

      // Always try AI analysis first if user has credits
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

          if (aiResult?.success) {
            console.log('AI analysis successful');
            const aiAnalysis = aiResult.analysis;
            
            analysisData = {
              user_id: user?.id,
              cv_upload_id: cvUpload.id,
              job_description_upload_id: jobUpload.id,
              job_title: finalJobTitle,
              company_name: extractCompanyFromText(uploadedFiles.jobDescription.extractedText),
              compatibility_score: aiAnalysis.compatibilityScore,
              keywords_found: aiAnalysis.keywordsFound,
              keywords_missing: aiAnalysis.keywordsMissing,
              strengths: aiAnalysis.strengths,
              weaknesses: aiAnalysis.weaknesses,
              recommendations: aiAnalysis.recommendations,
              executive_summary: aiAnalysis.executiveSummary,
              analysis_type: 'ai',
              skills_gap_analysis: aiAnalysis.skillsGapAnalysis,
              ats_optimization: aiAnalysis.atsOptimization,
              interview_prep: aiAnalysis.interviewPrep
            };

            toast({ 
              title: 'Analysis Complete!', 
              description: `Comprehensive analysis completed. ${aiResult.creditsRemaining} credits remaining.` 
            });
          } else {
            throw new Error('AI analysis failed');
          }
        } catch (aiError) {
          console.error('AI analysis failed, falling back to basic analysis:', aiError);
          toast({ 
            title: 'AI Analysis Unavailable', 
            description: 'Analysis completed with basic features.',
            variant: 'destructive' 
          });
          
          // Fall back to basic analysis
          analysisData = await performBasicAnalysis(cvUpload, jobUpload, finalJobTitle, uploadedFiles);
        }
      } else {
        console.log('No credits available, using basic analysis');
        toast({ 
          title: 'No Credits Available', 
          description: 'Using basic analysis. Purchase credits for comprehensive AI analysis.' 
        });
        
        // Use basic analysis
        analysisData = await performBasicAnalysis(cvUpload, jobUpload, finalJobTitle, uploadedFiles);
      }

      // Save analysis results
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
      toast({ title: 'Success', description: 'Analysis completed successfully!' });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Error', description: 'Failed to analyze CV. Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const performBasicAnalysis = async (cvUpload: any, jobUpload: any, finalJobTitle: string, uploadedFiles: any) => {
    const cvText = uploadedFiles.cv!.extractedText.toLowerCase();
    const jobText = uploadedFiles.jobDescription!.extractedText.toLowerCase();

    const jobWords = jobText.split(/\W+/).filter(word => word.length > 3);
    const keyTerms = [...new Set(jobWords)] as string[];

    const matchingTerms = keyTerms.filter(term => cvText.includes(term));
    const missingTerms = keyTerms.filter(term => !cvText.includes(term));

    const compatibilityScore = Math.round((matchingTerms.length / keyTerms.length) * 100);

    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription!.extractedText);

    return {
      user_id: user?.id,
      cv_upload_id: cvUpload.id,
      job_description_upload_id: jobUpload.id,
      job_title: finalJobTitle,
      company_name: extractedCompany,
      compatibility_score: compatibilityScore,
      keywords_found: matchingTerms.slice(0, 10),
      keywords_missing: missingTerms.slice(0, 10),
      strengths: generateStrengths(matchingTerms, compatibilityScore),
      weaknesses: generateWeaknesses(missingTerms, compatibilityScore),
      recommendations: generateRecommendations(missingTerms, compatibilityScore),
      executive_summary: generateExecutiveSummary(compatibilityScore, finalJobTitle),
      analysis_type: 'basic'
    };
  };

  return {
    analyzing,
    analysisResult,
    setAnalysisResult,
    performAnalysis
  };
};
