import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { saveFilesToDatabase, performAIAnalysis, saveAnalysisResults } from '@/services/analysisService';
import { performComprehensiveAnalysis } from '@/utils/analysisEngine';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysisExecution = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const executeAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useComprehensive: boolean,
    userCredits: any
  ) => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      throw new Error('Please upload both CV and job description');
    }

    console.log('Starting enhanced comprehensive CV analysis...');

    const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

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
        
        // Preserve the full enhanced structure from AI response
        const enhancedAnalysis = aiResult.analysis;
        
        // Add necessary metadata for database storage while preserving enhanced structure
        analysisResult = {
          ...enhancedAnalysis,
          user_id: user?.id,
          cv_upload_id: cvUpload.id,
          job_description_upload_id: jobUpload.id,
          // Keep legacy fields for backward compatibility
          job_title: enhancedAnalysis.position || finalJobTitle,
          company_name: enhancedAnalysis.companyName || extractedCompany,
          compatibility_score: enhancedAnalysis.compatibilityScore,
          executive_summary: enhancedAnalysis.executiveSummary?.overview || 'Enhanced AI analysis completed successfully.',
          // Extract simple arrays for legacy database fields
          keywords_found: enhancedAnalysis.keywordAnalysis?.keywords?.filter((k: any) => k.found).map((k: any) => k.keyword) || [],
          keywords_missing: enhancedAnalysis.keywordAnalysis?.keywords?.filter((k: any) => !k.found).map((k: any) => k.keyword) || [],
          strengths: enhancedAnalysis.executiveSummary?.strengths?.map((s: any) => s.title || s) || [],
          weaknesses: enhancedAnalysis.executiveSummary?.weaknesses?.map((w: any) => w.title || w) || [],
          recommendations: enhancedAnalysis.priorityRecommendations?.map((r: any) => r.title || r) || []
        };

        toast({ 
          title: 'Enhanced Analysis Complete!', 
          description: `Comprehensive AI-powered analysis with detailed insights completed. ${aiResult.creditsRemaining || 0} credits remaining.` 
        });
      } catch (aiError) {
        console.error('Enhanced AI analysis failed, falling back to comprehensive algorithmic analysis:', aiError);
        
        // Fall back to comprehensive local analysis
        analysisResult = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }
    } else {
      console.log('No credits available, using comprehensive algorithmic analysis');
      
      // Use comprehensive local analysis
      analysisResult = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
      
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

    console.log('Enhanced comprehensive analysis completed successfully:', finalResult);
    return finalResult;
  };

  return { executeAnalysis };
};
