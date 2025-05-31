
export interface CVUpload {
  id: number | string; // Handle both UUID types from database
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
  file_type?: string;
}
