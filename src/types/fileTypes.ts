
import { DocumentJson } from '@/utils/documentJsonUtils';

export interface UploadedFile {
  id?: string;
  file?: File;
  fileName?: string;
  extractedText: string;
  documentJson?: DocumentJson;
  type?: 'cv' | 'job_description';
  fileType?: string;
  uploadType?: string;
}

export interface JobDescriptionFile {
  file: File;
  extractedText: string;
  type: 'job_description';
}
