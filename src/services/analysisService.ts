
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
  console.log('Saving files to database...');
  
  // Ensure user is authenticated before proceeding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save files');
  }
  
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

  return { cvUpload, jobUpload };
};

export const performAIAnalysis = async (
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
  finalJobTitle: string,
  userId: string
) => {
  console.log('Attempting enhanced comprehensive AI analysis...');
  
  // Ensure user is authenticated before proceeding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to perform analysis');
  }
  
  const { data: aiResult, error: aiError } = await supabase.functions.invoke('analyze-cv-with-ai', {
    body: {
      cvText: uploadedFiles.cv!.extractedText,
      jobDescriptionText: uploadedFiles.jobDescription!.extractedText,
      jobTitle: finalJobTitle,
      userId: userId
    }
  });

  console.log('Enhanced AI analysis response:', aiResult);

  if (aiError) {
    console.error('Enhanced AI analysis error:', aiError);
    throw aiError;
  }

  if (!aiResult?.success || !aiResult?.analysis) {
    throw new Error('Enhanced AI analysis returned invalid results');
  }

  return aiResult;
};

export const saveAnalysisResults = async (analysisData: any) => {
  console.log('Saving enhanced analysis results to database...');
  
  // Ensure user is authenticated before proceeding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save analysis results');
  }
  
  const { data: analysisResult, error: analysisError } = await supabase
    .from('analysis_results')
    .insert(analysisData)
    .select()
    .single();

  if (analysisError) {
    console.error('Enhanced analysis save error:', analysisError);
    throw analysisError;
  }

  // Update analysis logs with the analysis result ID
  if (analysisResult?.id && analysisData.user_id) {
    const { error: logUpdateError } = await supabase
      .from('analysis_logs')
      .update({ analysis_result_id: analysisResult.id })
      .eq('user_id', analysisData.user_id)
      .is('analysis_result_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (logUpdateError) {
      console.error('Failed to link analysis log to result:', logUpdateError);
    }
  }

  return analysisResult;
};

