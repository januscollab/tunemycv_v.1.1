
import { DocumentJson } from '@/utils/documentJsonUtils';

export interface UploadedFile {
  file: File;
  extractedText: string;
  documentJson?: DocumentJson;
  type: 'cv' | 'job_description';
}

export interface JobDescriptionFile {
  file: File;
  extractedText: string;
  type: 'job_description';
}
