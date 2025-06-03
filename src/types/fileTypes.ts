
export interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export interface JobDescriptionFile {
  file: File;
  extractedText: string;
  type: 'job_description';
}

export interface AnalysisData {
  id: string;
  job_title: string;
  company_name: string;
  created_at?: string;
  compatibility_score?: number;
  cv_extracted_text?: string;
  job_description_extracted_text?: string;
}
