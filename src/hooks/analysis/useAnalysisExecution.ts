import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { saveFilesToDatabase, performAIAnalysis, saveAnalysisResults } from '@/services/analysisService';
import { performComprehensiveAnalysis } from '@/utils/analysisEngine';
import { useN8nAnalysis } from '@/hooks/useN8nAnalysis';
import { UploadedFile } from '@/types/fileTypes';

interface AnalysisOptions {
  saveCV: boolean;
  saveJobDescription: boolean;
  cvSource: 'new' | 'saved';
  existingCVId?: string;
}

export const useAnalysisExecution = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const n8nAnalysis = useN8nAnalysis();

  const executeAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useComprehensive: boolean,
    userCredits: any,
    options: AnalysisOptions
  ) => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      throw new Error('Please upload both CV and job description');
    }

    console.log('Starting enhanced comprehensive CV analysis with options:', options);

    const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

    // Save files to database based on user preferences
    const { cvUpload, jobUpload } = await saveFilesToDatabase(
      uploadedFiles, 
      finalJobTitle, 
      user?.id!, 
      options
    );

    console.log('Files handled successfully, starting n8n analysis workflow...');

    // Try n8n analysis first
    const n8nResult = await n8nAnalysis.submitForAnalysis(
      uploadedFiles.cv.file,
      uploadedFiles.jobDescription.file
    );

    if (n8nResult.success) {
      // n8n analysis succeeded - return the URLs for display
      return {
        success: true,
        type: 'n8n',
        htmlUrl: n8nResult.htmlUrl,
        pdfUrl: n8nResult.pdfUrl,
        message: n8nResult.data.message,
        cv_file_name: uploadedFiles.cv.file.name,
        job_description_file_name: uploadedFiles.jobDescription.file.name,
        job_title: finalJobTitle,
        company_name: extractedCompany
      };
    }

    // If n8n fails, fall back to existing AI/algorithmic analysis
    console.log('n8n analysis failed, falling back to existing analysis methods');
    
    let analysisResult;
    const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

    // Try AI analysis if user has credits, otherwise use comprehensive local analysis
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
          cv_upload_id: cvUpload?.id || null,
          job_description_upload_id: jobUpload?.id || null,
          cv_file_name: uploadedFiles.cv.file.name,
          cv_file_size: uploadedFiles.cv.file.size,
          cv_extracted_text: uploadedFiles.cv.extractedText,
          job_description_file_name: uploadedFiles.jobDescription.file.name,
          job_description_extracted_text: uploadedFiles.jobDescription.extractedText,
          job_title: enhancedAnalysis.position || finalJobTitle,
          company_name: enhancedAnalysis.companyName || extractedCompany,
          compatibility_score: enhancedAnalysis.compatibilityScore,
          executive_summary: enhancedAnalysis.executiveSummary?.overview || 'Enhanced AI analysis completed successfully.',
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
        analysisResult = await performComprehensiveAnalysis(
          cvUpload || { 
            id: 'temp', 
            file_name: uploadedFiles.cv.file.name,
            extracted_text: uploadedFiles.cv.extractedText 
          }, 
          jobUpload || { 
            id: 'temp', 
            file_name: uploadedFiles.jobDescription.file.name,
            extracted_text: uploadedFiles.jobDescription.extractedText 
          }, 
          finalJobTitle, 
          extractedCompany, 
          uploadedFiles, 
          user?.id!
        );
        
        // Add metadata for decoupling and temporary analyses
        analysisResult.cv_file_name = uploadedFiles.cv.file.name;
        analysisResult.cv_file_size = uploadedFiles.cv.file.size;
        analysisResult.cv_extracted_text = uploadedFiles.cv.extractedText;
        analysisResult.job_description_file_name = uploadedFiles.jobDescription.file.name;
        analysisResult.job_description_extracted_text = uploadedFiles.jobDescription.extractedText;
        analysisResult.cv_upload_id = cvUpload?.id || null;
        analysisResult.job_description_upload_id = jobUpload?.id || null;
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Comprehensive analysis completed using advanced algorithms.'
        });
      }
    } else {
      console.log('No credits available, using comprehensive algorithmic analysis');
      
      // Use comprehensive local analysis
      analysisResult = await performComprehensiveAnalysis(
        cvUpload || { 
          id: 'temp', 
          file_name: uploadedFiles.cv.file.name,
          extracted_text: uploadedFiles.cv.extractedText 
        }, 
        jobUpload || { 
          id: 'temp', 
          file_name: uploadedFiles.jobDescription.file.name,
          extracted_text: uploadedFiles.jobDescription.extractedText 
        }, 
        finalJobTitle, 
        extractedCompany, 
        uploadedFiles, 
        user?.id!
      );
      
      // Add metadata for decoupling and temporary analyses
      analysisResult.cv_file_name = uploadedFiles.cv.file.name;
      analysisResult.cv_file_size = uploadedFiles.cv.file.size;
      analysisResult.cv_extracted_text = uploadedFiles.cv.extractedText;
      analysisResult.job_description_file_name = uploadedFiles.jobDescription.file.name;
      analysisResult.job_description_extracted_text = uploadedFiles.jobDescription.extractedText;
      analysisResult.cv_upload_id = cvUpload?.id || null;
      analysisResult.job_description_upload_id = jobUpload?.id || null;
      
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
      cv_file_name: analysisResult.cv_file_name,
      cv_file_size: analysisResult.cv_file_size,
      cv_extracted_text: analysisResult.cv_extracted_text,
      job_description_file_name: analysisResult.job_description_file_name,
      job_description_extracted_text: analysisResult.job_description_extracted_text,
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
