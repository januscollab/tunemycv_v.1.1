
import { supabase } from '@/integrations/supabase/client';
import { extractJobTitleFromText, extractCompanyFromText } from '@/utils/analysisUtils';
import { UploadedFile } from '@/types/fileTypes';

interface SaveFilesOptions {
  saveCV: boolean;
  saveJobDescription: boolean;
  cvSource: 'new' | 'saved';
  existingCVId?: string;
}

export const saveFilesToDatabase = async (
  uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
  finalJobTitle: string,
  userId: string,
  options: SaveFilesOptions
) => {
  console.log('Saving files to database with options:', options);
  
  // Ensure user is authenticated before proceeding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save files');
  }
  
  let cvUpload = null;
  let jobUpload = null;

  // Handle CV saving based on source and user preference
  if (options.cvSource === 'saved' && options.existingCVId) {
    // Use existing saved CV
    const { data: existingCV, error: cvFetchError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', options.existingCVId)
      .eq('user_id', userId)
      .single();

    if (cvFetchError) throw cvFetchError;
    cvUpload = existingCV;
  } else if (options.saveCV && uploadedFiles.cv) {
    // Save new CV if user chose to save it
    const { data, error: cvError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
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
    cvUpload = data;
  }

  // Handle job description saving
  if (options.saveJobDescription && uploadedFiles.jobDescription) {
    const { data, error: jobError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
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
    jobUpload = data;
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
  
  // Prepare data for insertion - handle nullable upload IDs for temporary analyses
  const insertData = {
    user_id: analysisData.user_id,
    cv_upload_id: analysisData.cv_upload_id || null, // Can be null for temporary CV
    job_description_upload_id: analysisData.job_description_upload_id || null, // Now nullable for temporary analyses
    cv_file_name: analysisData.cv_file_name,
    cv_file_size: analysisData.cv_file_size,
    cv_extracted_text: analysisData.cv_extracted_text,
    job_description_file_name: analysisData.job_description_file_name,
    job_description_extracted_text: analysisData.job_description_extracted_text,
    job_title: analysisData.job_title,
    company_name: analysisData.company_name,
    compatibility_score: analysisData.compatibility_score,
    keywords_found: analysisData.keywords_found,
    keywords_missing: analysisData.keywords_missing,
    strengths: analysisData.strengths,
    weaknesses: analysisData.weaknesses,
    recommendations: analysisData.recommendations,
    executive_summary: analysisData.executive_summary
  };

  const { data: analysisResult, error: analysisError } = await supabase
    .from('analysis_results')
    .insert(insertData)
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
