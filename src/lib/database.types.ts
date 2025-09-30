export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notices: {
        Row: {
          id: string
          content: string
          categories: string[]
          tags: string[]
          author: string
          like_count: number
          created_at: string
          is_recommended: boolean | null
          is_popular: boolean | null
          usage_count: number | null
          updated_at: string
        }
        Insert: {
          id: string
          content: string
          categories: string[]
          tags?: string[] | null
          author: string
          like_count?: number
          created_at?: string
          is_recommended?: boolean | null
          is_popular?: boolean | null
          usage_count?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          categories?: string[]
          tags?: string[] | null
          author?: string
          like_count?: number
          created_at?: string
          usage_count?: number | null
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          title: string
          content: string
          categories: string[]
          created_by: string
          created_at: string
          updated_at: string
          is_public: boolean
          is_edited: boolean
          original_block_id: string | null
          usage_count: number
          likes_count: number
          report_status: 'none' | 'reported' | 'hidden' | 'approved'
          report_count: number
          season: string | null
          months: number[] | null
          special_periods: string[] | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          categories: string[]
          created_by: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          is_edited?: boolean
          original_block_id?: string | null
          usage_count?: number
          likes_count?: number
          report_status?: 'none' | 'reported' | 'hidden' | 'approved'
          report_count?: number
          season?: string | null
          months?: number[] | null
          special_periods?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          categories?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          is_edited?: boolean
          original_block_id?: string | null
          usage_count?: number
          likes_count?: number
          report_status?: 'none' | 'reported' | 'hidden' | 'approved'
          report_count?: number
          season?: string | null
          months?: number[] | null
          special_periods?: string[] | null
        }
      }
      reports: {
        Row: {
          id: string
          block_id: string
          reporter_id: string
          report_type: 'inappropriate_content' | 'inappropriate_tag' | 'spam' | 'other'
          reason: string
          created_at: string
          status: 'pending' | 'resolved' | 'dismissed'
          admin_notes: string | null
        }
        Insert: {
          id?: string
          block_id: string
          reporter_id: string
          report_type: 'inappropriate_content' | 'inappropriate_tag' | 'spam' | 'other'
          reason: string
          created_at?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          admin_notes?: string | null
        }
        Update: {
          id?: string
          block_id?: string
          reporter_id?: string
          report_type?: 'inappropriate_content' | 'inappropriate_tag' | 'spam' | 'other'
          reason?: string
          created_at?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          admin_notes?: string | null
        }
      }
      editing_sessions: {
        Row: {
          id: string
          user_id: string
          selected_blocks: string[]
          editing_blocks: Json
          auto_title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          selected_blocks: string[]
          editing_blocks: Json
          auto_title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          selected_blocks?: string[]
          editing_blocks?: Json
          auto_title?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          school_name: string
          phone: string | null
          position: string | null
          is_approved: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          usage_stats: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          school_name: string
          phone?: string | null
          position?: string | null
          is_approved?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          usage_stats?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          school_name?: string
          phone?: string | null
          position?: string | null
          is_approved?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          usage_stats?: Json | null
        }
      }
      block_likes: {
        Row: {
          id: string
          block_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          block_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          block_id?: string
          user_id?: string
          created_at?: string
        }
      }
      block_usage: {
        Row: {
          id: string
          block_id: string
          user_id: string
          used_at: string
          session_id: string | null
        }
        Insert: {
          id?: string
          block_id: string
          user_id: string
          used_at?: string
          session_id?: string | null
        }
        Update: {
          id?: string
          block_id?: string
          user_id?: string
          used_at?: string
          session_id?: string | null
        }
      }
      ai_generated_blocks: {
        Row: {
          id: string
          generated_by: 'weather' | 'news' | 'custom'
          prompt_data: Json
          generated_content: string
          categories: string[]
          confidence_score: number
          user_rating: number | null
          usage_count: number
          created_at: string
          is_approved: boolean
          weather_data: Json | null
          generation_date: string
        }
        Insert: {
          id?: string
          generated_by: 'weather' | 'news' | 'custom'
          prompt_data: Json
          generated_content: string
          categories: string[]
          confidence_score: number
          user_rating?: number | null
          usage_count?: number
          created_at?: string
          is_approved?: boolean
          weather_data?: Json | null
          generation_date: string
        }
        Update: {
          id?: string
          generated_by?: 'weather' | 'news' | 'custom'
          prompt_data?: Json
          generated_content?: string
          categories?: string[]
          confidence_score?: number
          user_rating?: number | null
          usage_count?: number
          created_at?: string
          is_approved?: boolean
          weather_data?: Json | null
          generation_date?: string
        }
      }
      weather_cache: {
        Row: {
          id: string
          date: string
          location: string
          weather_data: Json
          fetched_at: string
        }
        Insert: {
          id?: string
          date: string
          location: string
          weather_data: Json
          fetched_at?: string
        }
        Update: {
          id?: string
          date?: string
          location?: string
          weather_data?: Json
          fetched_at?: string
        }
      }
      ai_generation_history: {
        Row: {
          id: string
          user_id: string | null
          generation_type: 'weather' | 'news' | 'custom' | 'daily_auto'
          input_hash: string
          generated_block_id: string
          created_at: string
          success: boolean
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          generation_type: 'weather' | 'news' | 'custom' | 'daily_auto'
          input_hash: string
          generated_block_id: string
          created_at?: string
          success?: boolean
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          generation_type?: 'weather' | 'news' | 'custom' | 'daily_auto'
          input_hash?: string
          generated_block_id?: string
          created_at?: string
          success?: boolean
          error_message?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
