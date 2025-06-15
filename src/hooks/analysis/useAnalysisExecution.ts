import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { saveFilesToDatabase, saveAnalysisResults } from '@/services/analysisService';
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

    console.log('Starting n8n-only CV analysis with options:', options);

    const finalJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
    const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

    // Save files to database based on user preferences
    const { cvUpload, jobUpload } = await saveFilesToDatabase(
      uploadedFiles, 
      finalJobTitle, 
      user?.id!, 
      options
    );

    console.log('Files handled successfully, starting n8n-only analysis...');

    // CV Analysis - ONLY use n8n workflow (no fallbacks)
    console.log('Starting n8n-only CV analysis...');
    
    let analysisResult;
    
    try {
      console.log('Attempting n8n analysis with document JSON...');
      
      // Use document JSON if available, otherwise convert from extracted text
      const cvJson = uploadedFiles.cv.documentJson || {
        content: uploadedFiles.cv.extractedText,
        metadata: {
          fileName: uploadedFiles.cv.file.name,
          fileSize: uploadedFiles.cv.file.size
        }
      };
      
      const jdJson = uploadedFiles.jobDescription.documentJson || {
        content: uploadedFiles.jobDescription.extractedText,
        metadata: {
          fileName: uploadedFiles.jobDescription.file.name,
          fileSize: uploadedFiles.jobDescription.file.size
        }
      };

      const n8nResult = await n8nAnalysis.submitForAnalysis(cvJson, jdJson);

      if (n8nResult.success && n8nResult.test_files) {
        console.log('n8n analysis successful');
        
        analysisResult = {
          user_id: user?.id,
          cv_upload_id: cvUpload?.id || null,
          job_description_upload_id: jobUpload?.id || null,
          cv_file_name: uploadedFiles.cv.file.name,
          cv_file_size: uploadedFiles.cv.file.size,
          cv_extracted_text: uploadedFiles.cv.extractedText,
          job_description_file_name: uploadedFiles.jobDescription.file.name,
          job_description_extracted_text: uploadedFiles.jobDescription.extractedText,
          job_title: finalJobTitle,
          company_name: extractedCompany,
          compatibility_score: 85, // Default score for n8n results
          executive_summary: 'Analysis completed via n8n processing workflow.',
          analysis_type: 'n8n',
          n8n_html_url: n8nResult.test_files.html,
          n8n_pdf_url: n8nResult.test_files.pdf,
          pdf_file_data: n8nResult.pdfData,
          html_file_data: n8nResult.htmlData,
          pdf_file_name: `analysis_${finalJobTitle}_${extractedCompany}.pdf`,
          html_file_name: `analysis_${finalJobTitle}_${extractedCompany}.html`,
          keywords_found: [],
          keywords_missing: [],
          strengths: [],
          weaknesses: [],
          recommendations: []
        };

        // Save analysis results to database immediately for n8n
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
          executive_summary: analysisResult.executive_summary,
          analysis_type: analysisResult.analysis_type,
          n8n_html_url: analysisResult.n8n_html_url,
          n8n_pdf_url: analysisResult.n8n_pdf_url,
          pdf_file_data: analysisResult.pdf_file_data,
          html_file_data: analysisResult.html_file_data,
          pdf_file_name: analysisResult.pdf_file_name,
          html_file_name: analysisResult.html_file_name
        });

        console.log('n8n CV analysis completed successfully:', { ...savedResult, ...analysisResult });
        
        toast({ 
          title: 'Analysis Complete!', 
          description: 'Your CV analysis has been completed successfully via n8n.'
        });
        
        return { ...savedResult, ...analysisResult };
      } else {
        // n8n failed - no fallbacks, just throw error
        throw new Error(n8nResult.error || 'n8n analysis failed to produce valid results');
      }
    } catch (n8nError) {
      console.error('n8n CV analysis failed:', n8nError);
      
      // No fallbacks - rethrow the error to be handled by the calling function
      throw new Error(`CV analysis failed: ${n8nError instanceof Error ? n8nError.message : 'n8n processing error'}`);
    }

  };

  return { executeAnalysis };
};
