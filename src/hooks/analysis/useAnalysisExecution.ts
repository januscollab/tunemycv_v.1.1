import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { analyzeCVContent, validateAnalysisResult } from '@/utils/contentValidation';
import { saveFilesToDatabase, performAIAnalysis, saveAnalysisResults } from '@/services/analysisService';
import { performComprehensiveAnalysis } from '@/utils/analysisEngine';
import { useScoreValidation } from './useScoreValidation';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysisExecution = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateAndCorrectScore } = useScoreValidation();

  const executeAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useComprehensive: boolean,
    userCredits: any
  ) => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      throw new Error('Please upload both CV and job description');
    }

    console.log('Starting enhanced comprehensive CV analysis with quality validation...');

    const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

    // Pre-analyze CV content for validation
    const cvContentAnalysis = analyzeCVContent(uploadedFiles.cv.extractedText);
    console.log('CV content analysis completed:', cvContentAnalysis);

    // Save files to database first
    const { cvUpload, jobUpload } = await saveFilesToDatabase(uploadedFiles, finalJobTitle, user?.id!);

    console.log('Files uploaded successfully, starting enhanced comprehensive analysis...');

    let analysisResult;
    const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

    // Always try enhanced AI analysis if user has credits, otherwise use comprehensive local analysis
    if (hasCreditsForAI) {
      try {
        const aiResult = await performAIAnalysis(uploadedFiles, finalJobTitle, user?.id!);
        
        console.log('Enhanced AI-powered comprehensive analysis successful');
        
        // Validate and correct the score if needed
        const validatedAnalysis = await validateAndCorrectScore(aiResult.analysis, user?.id!);
        
        // Perform quality validation
        const qualityValidation = validateAnalysisResult(validatedAnalysis, cvContentAnalysis);
        
        console.log('Quality validation completed:', qualityValidation);
        
        // Add necessary metadata for database storage while preserving enhanced structure
        analysisResult = {
          ...validatedAnalysis,
          user_id: user?.id,
          cv_upload_id: cvUpload.id,
          job_description_upload_id: jobUpload.id,
          // Add quality assurance data
          qualityFlags: qualityValidation.qualityFlags,
          confidenceScore: qualityValidation.confidenceScore,
          contentAnalysis: qualityValidation.contentAnalysis,
          // Keep legacy fields for backward compatibility
          job_title: validatedAnalysis.position || finalJobTitle,
          company_name: validatedAnalysis.companyName || extractedCompany,
          compatibility_score: validatedAnalysis.compatibilityScore,
          executive_summary: validatedAnalysis.executiveSummary?.overview || 'Enhanced AI analysis completed successfully.',
          // Extract simple arrays for legacy database fields
          keywords_found: validatedAnalysis.keywordAnalysis?.keywords?.filter((k: any) => k.found).map((k: any) => k.keyword) || [],
          keywords_missing: validatedAnalysis.keywordAnalysis?.keywords?.filter((k: any) => !k.found).map((k: any) => k.keyword) || [],
          strengths: validatedAnalysis.executiveSummary?.strengths?.map((s: any) => s.title || s) || [],
          weaknesses: validatedAnalysis.executiveSummary?.weaknesses?.map((w: any) => w.title || w) || [],
          recommendations: validatedAnalysis.priorityRecommendations?.map((r: any) => r.title || r) || []
        };

        // Show quality warning if confidence is low
        if (qualityValidation.confidenceScore < 70) {
          toast({ 
            title: 'Analysis Complete with Quality Concerns', 
            description: `Analysis completed but may contain inaccuracies (${qualityValidation.confidenceScore}% confidence). Please review carefully.`,
            variant: 'default'
          });
        } else {
          toast({ 
            title: 'Enhanced Analysis Complete!', 
            description: `High-quality AI analysis completed (${qualityValidation.confidenceScore}% confidence). ${aiResult.creditsRemaining || 0} credits remaining.` 
          });
        }
      } catch (aiError) {
        console.error('Enhanced AI analysis failed, falling back to comprehensive algorithmic analysis:', aiError);
        
        // Fall back to comprehensive local analysis
        analysisResult = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
        
        // Add basic content analysis for consistency
        analysisResult.contentAnalysis = cvContentAnalysis;
        analysisResult.qualityFlags = ['Using algorithmic analysis due to AI service unavailability'];
        analysisResult.confidenceScore = 75; // Default confidence for algorithmic analysis
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }
    } else {
      console.log('No credits available, using comprehensive algorithmic analysis');
      
      // Use comprehensive local analysis
      analysisResult = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
      
      // Add basic content analysis for consistency
      analysisResult.contentAnalysis = cvContentAnalysis;
      analysisResult.qualityFlags = [];
      analysisResult.confidenceScore = 75; // Default confidence for algorithmic analysis
      
      toast({ 
        title: 'Analysis Complete!', 
        description: 'Comprehensive analysis completed using advanced algorithms.'
      });
    }

    // Save analysis results to database
    const savedResult = await saveAnalysisResults({
      user_id: analysisResult.user_id,
      cv_upload_id: analysisResult.cv_upload_id,
      job_description_upload_id: analysisResult.job_description_upload_id,
      job_title: analysisResult.job_title,
      company_name: analysisResult.company_name,
      compatibility_score: analysisResult.compatibility_score,
      keywords_found: analysisResult.keywords_found,
      keywords_missing: analysisResult.keywords_missing,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      recommendations: analysisResult.recommendations,
      executive_summary: analysisResult.executive_summary
    });

    // Return the full enhanced result for frontend display
    const finalResult = {
      ...savedResult,
      ...analysisResult // Include all enhanced data for frontend
    };

    console.log('Enhanced comprehensive analysis with quality validation completed successfully:', finalResult);
    return finalResult;
  };

  return { executeAnalysis };
};
