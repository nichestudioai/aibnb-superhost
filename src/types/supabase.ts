// This is a basic type definition for the Supabase database
// In a real project, you would generate this using the Supabase CLI

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
      hosts: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          created_at?: string
          city?: string
          state?: string
          current_hosting?: boolean
          properties_owned?: number
          invitation_code?: string
          early_access?: boolean
        }
        Insert: {
          id: string
          name: string
          email: string
          phone: string
          created_at?: string
          city?: string
          state?: string
          current_hosting?: boolean
          properties_owned?: number
          invitation_code?: string
          early_access?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          created_at?: string
          city?: string
          state?: string
          current_hosting?: boolean
          properties_owned?: number
          invitation_code?: string
          early_access?: boolean
        }
      }
      properties: {
        Row: {
          id: string
          hosts_id: string
          title: string
          description?: string
          subdomain: string
          listing_url?: string
          platform?: string
          address?: Json
          amenities?: Json
          check_in_instructions?: string
          house_rules?: string
          chatbot_enabled?: boolean
          chatbot_personality?: string
          social_promotion_enabled?: boolean
          created_at?: string
          updated_at?: string
          street_address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
        }
        Insert: {
          id?: string
          hosts_id: string
          title: string
          description?: string
          subdomain: string
          listing_url?: string
          platform?: string
          address?: Json
          amenities?: Json
          check_in_instructions?: string
          house_rules?: string
          chatbot_enabled?: boolean
          chatbot_personality?: string
          social_promotion_enabled?: boolean
          created_at?: string
          updated_at?: string
          street_address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
        }
        Update: {
          id?: string
          hosts_id?: string
          title?: string
          description?: string
          subdomain?: string
          listing_url?: string
          platform?: string
          address?: Json
          amenities?: Json
          check_in_instructions?: string
          house_rules?: string
          chatbot_enabled?: boolean
          chatbot_personality?: string
          social_promotion_enabled?: boolean
          created_at?: string
          updated_at?: string
          street_address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
        }
      }
      property_faqs: {
        Row: {
          id: string
          property_id: string
          question: string
          answer: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          property_id: string
          question: string
          answer: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          question?: string
          answer?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_conversations: {
        Row: {
          id: string
          property_id: string
          guest_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          metadata?: Json
        }
        Insert: {
          id?: string
          property_id: string
          guest_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          metadata?: Json
        }
        Update: {
          id?: string
          property_id?: string
          guest_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          metadata?: Json
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          created_at?: string
          role: string
          content: string
          type?: string
          metadata?: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          created_at?: string
          role: string
          content: string
          type?: string
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          created_at?: string
          role?: string
          content?: string
          type?: string
          metadata?: Json
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
  }
}