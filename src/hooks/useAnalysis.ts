
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { useAnalysisState } from './useAnalysisState';
import { saveFilesToDatabase, performAIAnalysis, saveAnalysisResults } from '@/services/analysisService';
import { performComprehensiveAnalysis } from '@/utils/analysisEngine';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { analyzing, setAnalyzing, analysisResult, setAnalysisResult } = useAnalysisState();

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
      const { cvUpload, jobUpload } = await saveFilesToDatabase(uploadedFiles, finalJobTitle, user?.id!);

      console.log('Files uploaded successfully, starting analysis...');

      let analysisData;
      const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

      // Always try AI analysis if user has credits
      if (hasCreditsForAI) {
        try {
          const aiResult = await performAIAnalysis(uploadedFiles, finalJobTitle, user?.id!);
          
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
        } catch (aiError) {
          console.error('AI analysis failed, falling back to comprehensive analysis:', aiError);
          
          // Fall back to comprehensive local analysis
          analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
          
          toast({ 
            title: 'Analysis Complete!', 
            description: 'Comprehensive analysis completed using advanced algorithms.'
          });
        }
      } else {
        console.log('No credits available, using comprehensive analysis');
        
        // Use comprehensive local analysis
        analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }

      // Save analysis results
      const analysisResult = await saveAnalysisResults(analysisData);

      console.log('Analysis completed successfully:', analysisResult);
      setAnalysisResult(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Error', description: 'Failed to analyze CV. Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analysisResult,
    setAnalysisResult,
    performAnalysis
  };
};
