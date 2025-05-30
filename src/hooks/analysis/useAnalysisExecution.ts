
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

    console.log('Starting comprehensive CV analysis...');

    const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

    // Save files to database first
    const { cvUpload, jobUpload } = await saveFilesToDatabase(uploadedFiles, finalJobTitle, user?.id!);

    console.log('Files uploaded successfully, starting comprehensive analysis...');

    let analysisData;
    const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

    // Always try AI analysis if user has credits, otherwise use comprehensive local analysis
    if (hasCreditsForAI) {
      try {
        const aiResult = await performAIAnalysis(uploadedFiles, finalJobTitle, user?.id!);
        
        console.log('AI-powered comprehensive analysis successful');
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
          description: `Comprehensive AI-powered analysis completed. ${aiResult.creditsRemaining || 0} credits remaining.` 
        });
      } catch (aiError) {
        console.error('AI analysis failed, falling back to comprehensive algorithmic analysis:', aiError);
        
        // Fall back to comprehensive local analysis
        analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }
    } else {
      console.log('No credits available, using comprehensive algorithmic analysis');
      
      // Use comprehensive local analysis
      analysisData = await performComprehensiveAnalysis(cvUpload, jobUpload, finalJobTitle, extractedCompany, uploadedFiles, user?.id!);
      
      toast({ 
        title: 'Analysis Complete!', 
        description: 'Comprehensive analysis completed using advanced algorithms.'
      });
    }

    // Save analysis results
    const analysisResult = await saveAnalysisResults(analysisData);

    console.log('Comprehensive analysis completed successfully:', analysisResult);
    return analysisResult;
  };

  return { executeAnalysis };
};
