
import { supabase } from '@/integrations/supabase/client';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const saveFilesToDatabase = async (
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
  finalJobTitle: string,
  userId: string
) => {
  console.log('analysisService: Saving files to database...');
  console.log('analysisService: CV text length before save:', uploadedFiles.cv!.extractedText?.length || 0);
  console.log('analysisService: JD text length before save:', uploadedFiles.jobDescription!.extractedText?.length || 0);
  
  const { data: cvUpload, error: cvError } = await supabase
    .from('uploads')
    .insert({
      user_id: userId,
      file_name: uploadedFiles.cv!.file.name,
      file_type: uploadedFiles.cv!.file.type,
      file_size: uploadedFiles.cv!.file.size,
      upload_type: 'cv',
      extracted_text: uploadedFiles.cv!.extractedText,
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
      user_id: userId,
      file_name: uploadedFiles.jobDescription!.file.name,
      file_type: uploadedFiles.jobDescription!.file.type,
      file_size: uploadedFiles.jobDescription!.file.size,
      upload_type: 'job_description',
      extracted_text: uploadedFiles.jobDescription!.extractedText,
      job_title: finalJobTitle
    })
    .select()
    .single();

  if (jobError) {
    console.error('Job description upload error:', jobError);
    throw jobError;
  }

  console.log('analysisService: Files saved successfully');
  console.log('analysisService: CV upload ID:', cvUpload.id);
  console.log('analysisService: JD upload ID:', jobUpload.id);

  return { cvUpload, jobUpload };
};

export const performAIAnalysis = async (
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
  finalJobTitle: string,
  userId: string
) => {
  console.log('analysisService: Attempting enhanced comprehensive AI analysis...');
  console.log('analysisService: About to call edge function with:');
  console.log('analysisService: - CV text length:', uploadedFiles.cv!.extractedText?.length || 0);
  console.log('analysisService: - JD text length:', uploadedFiles.jobDescription!.extractedText?.length || 0);
  console.log('analysisService: - Job title:', finalJobTitle);
  console.log('analysisService: - User ID:', userId);
  console.log('analysisService: - First 500 chars of CV:', uploadedFiles.cv!.extractedText?.substring(0, 500) || 'NO CV TEXT');
  
  const { data: aiResult, error: aiError } = await supabase.functions.invoke('analyze-cv-with-ai', {
    body: {
      cvText: uploadedFiles.cv!.extractedText,
      jobDescriptionText: uploadedFiles.jobDescription!.extractedText,
      jobTitle: finalJobTitle,
      userId: userId
    }
  });

  console.log('analysisService: Enhanced AI analysis response:', aiResult);

  if (aiError) {
    console.error('analysisService: Enhanced AI analysis error:', aiError);
    throw aiError;
  }

  if (!aiResult?.success || !aiResult?.analysis) {
    console.error('analysisService: AI analysis returned invalid results:', aiResult);
    throw new Error('Enhanced AI analysis returned invalid results');
  }

  console.log('analysisService: AI analysis successful, compatibility score:', aiResult.analysis.compatibilityScore);
  return aiResult;
};

export const saveAnalysisResults = async (analysisData: any) => {
  console.log('analysisService: Saving enhanced analysis results to database...');
  
  const { data: analysisResult, error: analysisError } = await supabase
    .from('analysis_results')
    .insert(analysisData)
    .select()
    .single();

  if (analysisError) {
    console.error('analysisService: Enhanced analysis save error:', analysisError);
    throw analysisError;
  }

  console.log('analysisService: Analysis results saved successfully');
  return analysisResult;
};
