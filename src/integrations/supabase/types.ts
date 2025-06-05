export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_logs: {
        Row: {
          analysis_result_id: string | null
          cost_estimate: number | null
          cover_letter_id: string | null
          created_at: string
          cv_upload_id: string | null
          error_message: string | null
          id: string
          job_description_upload_id: string | null
          openai_model: string
          operation_type: string | null
          processing_time_ms: number | null
          prompt_text: string
          response_metadata: Json | null
          response_text: string
          status: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          analysis_result_id?: string | null
          cost_estimate?: number | null
          cover_letter_id?: string | null
          created_at?: string
          cv_upload_id?: string | null
          error_message?: string | null
          id?: string
          job_description_upload_id?: string | null
          openai_model?: string
          operation_type?: string | null
          processing_time_ms?: number | null
          prompt_text: string
          response_metadata?: Json | null
          response_text: string
          status?: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          analysis_result_id?: string | null
          cost_estimate?: number | null
          cover_letter_id?: string | null
          created_at?: string
          cv_upload_id?: string | null
          error_message?: string | null
          id?: string
          job_description_upload_id?: string | null
          openai_model?: string
          operation_type?: string | null
          processing_time_ms?: number | null
          prompt_text?: string
          response_metadata?: Json | null
          response_text?: string
          status?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_logs_analysis_result_id_fkey"
            columns: ["analysis_result_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_cover_letter_id_fkey"
            columns: ["cover_letter_id"]
            isOneToOne: false
            referencedRelation: "cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_cv_upload_id_fkey"
            columns: ["cv_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_job_description_upload_id_fkey"
            columns: ["job_description_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_results: {
        Row: {
          company_name: string | null
          compatibility_score: number
          created_at: string | null
          cv_extracted_text: string | null
          cv_file_name: string | null
          cv_file_size: number | null
          cv_upload_id: string | null
          deleted_at: string | null
          executive_summary: string | null
          id: string
          job_description_extracted_text: string | null
          job_description_file_name: string | null
          job_description_upload_id: string | null
          job_title: string | null
          keywords_found: Json | null
          keywords_missing: Json | null
          recommendations: string[] | null
          strengths: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          company_name?: string | null
          compatibility_score: number
          created_at?: string | null
          cv_extracted_text?: string | null
          cv_file_name?: string | null
          cv_file_size?: number | null
          cv_upload_id?: string | null
          deleted_at?: string | null
          executive_summary?: string | null
          id?: string
          job_description_extracted_text?: string | null
          job_description_file_name?: string | null
          job_description_upload_id?: string | null
          job_title?: string | null
          keywords_found?: Json | null
          keywords_missing?: Json | null
          recommendations?: string[] | null
          strengths?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          company_name?: string | null
          compatibility_score?: number
          created_at?: string | null
          cv_extracted_text?: string | null
          cv_file_name?: string | null
          cv_file_size?: number | null
          cv_upload_id?: string | null
          deleted_at?: string | null
          executive_summary?: string | null
          id?: string
          job_description_extracted_text?: string | null
          job_description_file_name?: string | null
          job_description_upload_id?: string | null
          job_title?: string | null
          keywords_found?: Json | null
          keywords_missing?: Json | null
          recommendations?: string[] | null
          strengths?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_cv_upload_id_fkey"
            columns: ["cv_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_results_job_description_upload_id_fkey"
            columns: ["job_description_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letter_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_prompt: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          template_prompt: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_prompt?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          analysis_result_id: string | null
          company_name: string
          content: string
          created_at: string | null
          credits_used: number | null
          custom_hook_opener: string | null
          generation_parameters: Json | null
          id: string
          include_linkedin_url: boolean | null
          job_title: string
          personal_values: string | null
          regeneration_count: number | null
          template_id: string | null
          updated_at: string | null
          user_id: string
          work_experience_highlights: string | null
        }
        Insert: {
          analysis_result_id?: string | null
          company_name: string
          content: string
          created_at?: string | null
          credits_used?: number | null
          custom_hook_opener?: string | null
          generation_parameters?: Json | null
          id?: string
          include_linkedin_url?: boolean | null
          job_title: string
          personal_values?: string | null
          regeneration_count?: number | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
          work_experience_highlights?: string | null
        }
        Update: {
          analysis_result_id?: string | null
          company_name?: string
          content?: string
          created_at?: string | null
          credits_used?: number | null
          custom_hook_opener?: string | null
          generation_parameters?: Json | null
          id?: string
          include_linkedin_url?: boolean | null
          job_title?: string
          personal_values?: string | null
          regeneration_count?: number | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
          work_experience_highlights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_analysis_result_id_fkey"
            columns: ["analysis_result_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          personal_website_url: string | null
          phone_number: string | null
          soft_skills: Json | null
          survey_preferences: Json | null
          updated_at: string | null
          work_style_preferences: Json | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          linkedin_url?: string | null
          personal_website_url?: string | null
          phone_number?: string | null
          soft_skills?: Json | null
          survey_preferences?: Json | null
          updated_at?: string | null
          work_style_preferences?: Json | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          personal_website_url?: string | null
          phone_number?: string | null
          soft_skills?: Json | null
          survey_preferences?: Json | null
          updated_at?: string | null
          work_style_preferences?: Json | null
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          job_title: string | null
          upload_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          job_title?: string | null
          upload_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          job_title?: string | null
          upload_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          privacy_level: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          privacy_level?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          privacy_level?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analysis_logs_with_details: {
        Row: {
          analysis_result_id: string | null
          company_name: string | null
          compatibility_score: number | null
          cost_estimate: number | null
          created_at: string | null
          cv_file_name: string | null
          cv_upload_id: string | null
          entry_status: string | null
          error_message: string | null
          first_name: string | null
          id: string | null
          job_description_file_name: string | null
          job_description_upload_id: string | null
          job_title: string | null
          last_name: string | null
          openai_model: string | null
          operation_type: string | null
          processing_time_ms: number | null
          prompt_text: string | null
          response_text: string | null
          status: string | null
          tokens_used: number | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_logs_analysis_result_id_fkey"
            columns: ["analysis_result_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_cv_upload_id_fkey"
            columns: ["cv_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_job_description_upload_id_fkey"
            columns: ["job_description_upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_user_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
