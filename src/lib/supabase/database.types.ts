/**
 * Generated from the live schema. Regenerate after every migration:
 *
 *   supabase gen types typescript --project-id gdmrzgxylxwdcqfdxyzp \
 *     > src/lib/supabase/database.types.ts
 *
 * Note that `lessons.bunny_video_id` appears in this type but is not
 * readable by the anon/authenticated roles — only the service-role client
 * (src/lib/supabase/admin.ts) can actually select it. See PRD §5.2.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name_ar: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name_ar: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name_ar?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      checkout_leads: {
        Row: {
          course_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          status: Database['public']['Enums']['checkout_lead_status']
          updated_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          status?: Database['public']['Enums']['checkout_lead_status']
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          status?: Database['public']['Enums']['checkout_lead_status']
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          course_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          redemption_count: number
          starts_at: string | null
          type: Database['public']['Enums']['coupon_type']
          updated_at: string
          value: number
        }
        Insert: {
          code: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          starts_at?: string | null
          type: Database['public']['Enums']['coupon_type']
          updated_at?: string
          value: number
        }
        Update: {
          code?: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          starts_at?: string | null
          type?: Database['public']['Enums']['coupon_type']
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string | null
          certificate_enabled: boolean
          compare_at_price_egp: number | null
          created_at: string
          description_ar: string | null
          faq: Json
          id: string
          lesson_count: number
          level: Database['public']['Enums']['course_level']
          pain_points: Json
          price_egp: number
          price_usd: number | null
          promo_video_id: string | null
          published_at: string | null
          requirements: Json
          seo_description: string | null
          seo_title: string | null
          sequential_unlock: boolean
          slug: string
          status: Database['public']['Enums']['content_status']
          subtitle_ar: string | null
          target_audience: Json
          thumbnail_url: string | null
          title_ar: string
          total_duration_minutes: number
          updated_at: string
          what_you_learn: Json
        }
        Insert: {
          category_id?: string | null
          certificate_enabled?: boolean
          compare_at_price_egp?: number | null
          created_at?: string
          description_ar?: string | null
          faq?: Json
          id?: string
          lesson_count?: number
          level?: Database['public']['Enums']['course_level']
          pain_points?: Json
          price_egp?: number
          price_usd?: number | null
          promo_video_id?: string | null
          published_at?: string | null
          requirements?: Json
          seo_description?: string | null
          seo_title?: string | null
          sequential_unlock?: boolean
          slug: string
          status?: Database['public']['Enums']['content_status']
          subtitle_ar?: string | null
          target_audience?: Json
          thumbnail_url?: string | null
          title_ar: string
          total_duration_minutes?: number
          updated_at?: string
          what_you_learn?: Json
        }
        Update: {
          category_id?: string | null
          certificate_enabled?: boolean
          compare_at_price_egp?: number | null
          created_at?: string
          description_ar?: string | null
          faq?: Json
          id?: string
          lesson_count?: number
          level?: Database['public']['Enums']['course_level']
          pain_points?: Json
          price_egp?: number
          price_usd?: number | null
          promo_video_id?: string | null
          published_at?: string | null
          requirements?: Json
          seo_description?: string | null
          seo_title?: string | null
          sequential_unlock?: boolean
          slug?: string
          status?: Database['public']['Enums']['content_status']
          subtitle_ar?: string | null
          target_audience?: Json
          thumbnail_url?: string | null
          title_ar?: string
          total_duration_minutes?: number
          updated_at?: string
          what_you_learn?: Json
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          access_expires_at: string | null
          certificate_serial: string | null
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          order_id: string | null
          progress_percent: number
          status: Database['public']['Enums']['enrollment_status']
          updated_at: string
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          certificate_serial?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          progress_percent?: number
          status?: Database['public']['Enums']['enrollment_status']
          updated_at?: string
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          certificate_serial?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          progress_percent?: number
          status?: Database['public']['Enums']['enrollment_status']
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          course_id: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          source: Database['public']['Enums']['lead_source']
          updated_at: string
          utm: Json
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          source: Database['public']['Enums']['lead_source']
          updated_at?: string
          utm?: Json
        }
        Update: {
          course_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          source?: Database['public']['Enums']['lead_source']
          updated_at?: string
          utm?: Json
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean
          lesson_id: string
          updated_at: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          updated_at?: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          updated_at?: string
          watched_seconds?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          attachments: Json
          bunny_video_id: string | null
          course_id: string
          created_at: string
          description_ar: string | null
          duration_seconds: number
          id: string
          is_free_preview: boolean
          module_id: string
          slug: string
          sort_order: number
          title_ar: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          bunny_video_id?: string | null
          course_id: string
          created_at?: string
          description_ar?: string | null
          duration_seconds?: number
          id?: string
          is_free_preview?: boolean
          module_id: string
          slug: string
          sort_order?: number
          title_ar: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          bunny_video_id?: string | null
          course_id?: string
          created_at?: string
          description_ar?: string | null
          duration_seconds?: number
          id?: string
          is_free_preview?: boolean
          module_id?: string
          slug?: string
          sort_order?: number
          title_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title_ar: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title_ar: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          coupon_id: string | null
          course_id: string
          created_at: string
          currency: Database['public']['Enums']['currency_code']
          discount_amount: number
          id: string
          paid_at: string | null
          provider: Database['public']['Enums']['payment_provider']
          provider_order_id: string | null
          provider_txn_id: string | null
          raw_payload: Json | null
          status: Database['public']['Enums']['order_status']
          updated_at: string
          user_id: string
          utm: Json
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          course_id: string
          created_at?: string
          currency?: Database['public']['Enums']['currency_code']
          discount_amount?: number
          id?: string
          paid_at?: string | null
          provider: Database['public']['Enums']['payment_provider']
          provider_order_id?: string | null
          provider_txn_id?: string | null
          raw_payload?: Json | null
          status?: Database['public']['Enums']['order_status']
          updated_at?: string
          user_id: string
          utm?: Json
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          course_id?: string
          created_at?: string
          currency?: Database['public']['Enums']['currency_code']
          discount_amount?: number
          id?: string
          paid_at?: string | null
          provider?: Database['public']['Enums']['payment_provider']
          provider_order_id?: string | null
          provider_txn_id?: string | null
          raw_payload?: Json | null
          status?: Database['public']['Enums']['order_status']
          updated_at?: string
          user_id?: string
          utm?: Json
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_name: string | null
          body_ar: string | null
          cover_url: string | null
          created_at: string
          excerpt_ar: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database['public']['Enums']['content_status']
          tags: string[]
          title_ar: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body_ar?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database['public']['Enums']['content_status']
          tags?: string[]
          title_ar: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body_ar?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database['public']['Enums']['content_status']
          tags?: string[]
          title_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          last_seen_at: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          updated_at: string
          whatsapp_opt_in: boolean
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
          whatsapp_opt_in?: boolean
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
          whatsapp_opt_in?: boolean
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          asset_path: string | null
          avatar_url: string | null
          body_ar: string
          course_id: string | null
          created_at: string
          handle: string | null
          id: string
          is_published: boolean
          locale: Database['public']['Enums']['locale_code']
          media_type: Database['public']['Enums']['testimonial_media']
          name: string
          permission_status: Database['public']['Enums']['permission_status']
          rating: number
          role_ar: string | null
          sort_order: number
          source: Database['public']['Enums']['testimonial_source']
          updated_at: string
          video_id: string | null
        }
        Insert: {
          asset_path?: string | null
          avatar_url?: string | null
          body_ar: string
          course_id?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          is_published?: boolean
          locale?: Database['public']['Enums']['locale_code']
          media_type?: Database['public']['Enums']['testimonial_media']
          name: string
          permission_status?: Database['public']['Enums']['permission_status']
          rating?: number
          role_ar?: string | null
          sort_order?: number
          source: Database['public']['Enums']['testimonial_source']
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          asset_path?: string | null
          avatar_url?: string | null
          body_ar?: string
          course_id?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          is_published?: boolean
          locale?: Database['public']['Enums']['locale_code']
          media_type?: Database['public']['Enums']['testimonial_media']
          name?: string
          permission_status?: Database['public']['Enums']['permission_status']
          rating?: number
          role_ar?: string | null
          sort_order?: number
          source?: Database['public']['Enums']['testimonial_source']
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      lessons_public: {
        Row: {
          course_id: string | null
          description_ar: string | null
          duration_seconds: number | null
          id: string | null
          is_free_preview: boolean | null
          module_id: string | null
          slug: string | null
          sort_order: number | null
          title_ar: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      capture_checkout_lead: {
        Args: {
          p_course_id: string
          p_name?: string
          p_phone?: string
          p_email?: string
          p_status?: Database['public']['Enums']['checkout_lead_status']
          p_utm_source?: string
          p_utm_medium?: string
          p_utm_campaign?: string
        }
        Returns: string | null
      }
      claim_guest_orders: { Args: { p_user_id: string; p_email: string }; Returns: undefined }
      confirm_order: { Args: { p_order_id: string }; Returns: undefined }
      create_guest_order: {
        Args: {
          p_course_id: string
          p_name: string
          p_phone: string
          p_email: string
          p_reference?: string
          p_coupon_code?: string
        }
        Returns: string
      }
      create_pending_order: {
        Args: { p_course_id: string; p_coupon_code?: string; p_reference?: string }
        Returns: string
      }
      generate_certificate_serial: { Args: never; Returns: string }
      get_lesson_attachments: { Args: { p_lesson_id: string }; Returns: Json }
      get_lesson_video: { Args: { p_lesson_id: string }; Returns: string | null }
      has_course_access: { Args: { p_course_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      mark_lesson_complete: {
        Args: { p_lesson_id: string; p_watched_seconds?: number }
        Returns: undefined
      }
      set_lesson_attachments: {
        Args: { p_lesson_id: string; p_attachments: Json }
        Returns: undefined
      }
      reject_order: { Args: { p_order_id: string; p_reason?: string }; Returns: undefined }
      validate_coupon: { Args: { p_code: string; p_course_id: string }; Returns: Json }
    }
    Enums: {
      checkout_lead_status: 'abandoned' | 'started' | 'paid'
      content_status: 'draft' | 'published' | 'archived'
      coupon_type: 'percent' | 'fixed'
      course_level: 'beginner' | 'intermediate' | 'advanced'
      currency_code: 'EGP' | 'USD'
      enrollment_status: 'active' | 'revoked' | 'expired'
      lead_source: 'newsletter' | 'contact_form' | 'course_interest'
      locale_code: 'ar' | 'en'
      order_status: 'pending' | 'paid' | 'failed' | 'refunded'
      payment_provider: 'paymob' | 'stripe' | 'manual'
      permission_status: 'pending' | 'granted' | 'denied'
      testimonial_media: 'text' | 'screenshot' | 'result_photo' | 'certificate' | 'video'
      testimonial_source: 'in_person_training' | 'online_course'
      user_role: 'student' | 'admin'
    }
    CompositeTypes: Record<never, never>
  }
}

type DefaultSchema = Database['public']

export type Tables<T extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])> =
  (DefaultSchema['Tables'] & DefaultSchema['Views'])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema['Enums']> = DefaultSchema['Enums'][T]
