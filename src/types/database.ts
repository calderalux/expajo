// Database types for Supabase

// Enum for item types

export enum ServiceType {
  accommodation = 'accommodation',
  airport_transfer = 'airport_transfer',
  transportation = 'transportation',
  security = 'security',
  excursions = 'excursions',
  night_life = 'night_life',
  dining = 'dining',
  culture = 'culture',
  beach_resort = 'beach_resort',
  culinary = 'culinary',
  art_fashion = 'art_fashion',
  adventure = 'adventure',
  wellness = 'wellness',
  live_events = 'live_events',
  local_experiences = 'local_experiences',
  festivals = 'festivals',
  attractions = 'attractions',
}
export const serviceTypeToLabel: Record<ServiceType, string> = {
  accommodation: 'Accommodation',
  airport_transfer: 'Airport Transfer',
  transportation: 'Transportation',
  security: 'Security',
  excursions: 'Tours & Excursions',
  night_life: 'Night Life',
  dining: 'Dining',
  culture: 'Culture',
  beach_resort: 'Beach Resort',
  culinary: 'Culinary',
  art_fashion: 'Art & Fashion',
  adventure: 'Adventure',
  wellness: 'Wellness',
  live_events: 'Live Events',
  local_experiences: 'Local Experiences',
  festivals: 'Festivals',
  attractions: 'Attractions',
}


export interface Database {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          category: string | null;
          is_public: boolean | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          category?: string | null;
          is_public?: boolean | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          category?: string | null;
          is_public?: boolean | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: any | null;
          new_values: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      booking_options: {
        Row: {
          id: string;
          booking_id: string;
          option_id: string | null;
          option_name: string;
          price: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          option_id?: string | null;
          option_name: string;
          price?: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          option_id?: string | null;
          option_name?: string;
          price?: number;
        };
      };
      booking_service_assignments: {
        Row: {
          id: string;
          booking_id: string;
          package_partner_service_id: string | null;
          partner_id: string;
          item_type: string;
          option_id: string | null;
          partner_name: string | null;
          role: string | null;
          is_included: boolean | null;
          unit_price_usd: number;
          quantity: number;
          subtotal_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          package_partner_service_id?: string | null;
          partner_id: string;
          item_type: string;
          option_id?: string | null;
          partner_name?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          unit_price_usd?: number;
          quantity?: number;
          subtotal_usd?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          package_partner_service_id?: string | null;
          partner_id?: string;
          item_type?: string;
          option_id?: string | null;
          partner_name?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          unit_price_usd?: number;
          quantity?: number;
          subtotal_usd?: number | null;
          created_at?: string;
        };
      };
      package_item_options: {
        Row: {
          id: string;
          package_item_id: string;
          name: string;
          description: string | null;
          price: number;
          meta: any;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_item_id: string;
          name: string;
          description?: string | null;
          price?: number;
          meta?: any;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_item_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          meta?: any;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      package_items: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          item_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          item_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          item_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      package_option_mappings: {
        Row: {
          id: string;
          package_id: string;
          option_id: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          option_id: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          option_id?: string;
        };
      };
      package_partner_services: {
        Row: {
          id: string;
          package_id: string;
          partner_id: string;
          item_type: string;
          option_id: string | null;
          role: string | null;
          is_included: boolean | null;
          usd_price_override: number | null;
          commission_rate: number | null;
          capacity_per_day: number | null;
          service_window: string | null;
          notes: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          partner_id: string;
          item_type: string;
          option_id?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          usd_price_override?: number | null;
          commission_rate?: number | null;
          capacity_per_day?: number | null;
          service_window?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          partner_id?: string;
          item_type?: string;
          option_id?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          usd_price_override?: number | null;
          commission_rate?: number | null;
          capacity_per_day?: number | null;
          service_window?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          status: string | null;
          logo_url: string | null;
          website: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string | null;
          status?: string | null;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string | null;
          status?: string | null;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      plan_requests: {
        Row: {
          id: string;
          location: string;
          travel_date: string;
          guests: number;
          special_requests: string | null;
          budget_range: string | null;
          interests: string[] | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          location: string;
          travel_date: string;
          guests: number;
          special_requests?: string | null;
          budget_range?: string | null;
          interests?: string[] | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          location?: string;
          travel_date?: string;
          guests?: number;
          special_requests?: string | null;
          budget_range?: string | null;
          interests?: string[] | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          package_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          package_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          package_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role: string;
          resource: string;
          action: string;
          conditions: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          role: string;
          resource: string;
          action: string;
          conditions?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          resource?: string;
          action?: string;
          conditions?: any;
          created_at?: string;
        };
      };
      otp_codes: {
        Row: {
          id: string;
          email: string;
          code: string;
          purpose: string;
          expires_at: string;
          attempts: number;
          max_attempts: number;
          is_used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          purpose: string;
          expires_at: string;
          attempts?: number;
          max_attempts?: number;
          is_used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          purpose?: string;
          expires_at?: string;
          attempts?: number;
          max_attempts?: number;
          is_used?: boolean;
          created_at?: string;
        };
      };
      admin_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          expires_at: string;
          ip_address: string | null;
          user_agent: string | null;
          is_active: boolean;
          created_at: string;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          expires_at: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          created_at?: string;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          expires_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          created_at?: string;
          last_accessed_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          phone: string | null;
          membership: string;
          mfa_enabled: boolean;
          created_at: string;
          updated_at: string;
          is_admin: boolean;
          admin_level: number;
          last_login_at: string | null;
          login_count: number;
          two_factor_enabled: boolean;
          preferred_language: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          phone?: string | null;
          membership?: string;
          mfa_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          is_admin?: boolean;
          admin_level?: number;
          last_login_at?: string | null;
          login_count?: number;
          two_factor_enabled?: boolean;
          preferred_language?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          phone?: string | null;
          membership?: string;
          mfa_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          is_admin?: boolean;
          admin_level?: number;
          last_login_at?: string | null;
          login_count?: number;
          two_factor_enabled?: boolean;
          preferred_language?: string;
        };
      };
      app_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          permissions: any;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          permissions?: any;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          permissions?: any;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          is_active?: boolean;
        };
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          country: string;
          country_code: string | null;
          region: string | null;
          image_cover_url: string | null;
          image_gallery: any;
          avg_rating: number;
          review_count: number;
          package_count: number;
          featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          highlights: any;
          best_time_to_visit: string | null;
          climate: string | null;
          language: string | null;
          currency: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          country?: string;
          country_code?: string | null;
          region?: string | null;
          image_cover_url?: string | null;
          image_gallery?: any;
          avg_rating?: number;
          review_count?: number;
          package_count?: number;
          featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          highlights?: any;
          best_time_to_visit?: string | null;
          climate?: string | null;
          language?: string | null;
          currency?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          description?: string | null;
          country?: string;
          country_code?: string | null;
          region?: string | null;
          image_cover_url?: string | null;
          image_gallery?: any;
          avg_rating?: number;
          review_count?: number;
          package_count?: number;
          featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          highlights?: any;
          best_time_to_visit?: string | null;
          climate?: string | null;
          language?: string | null;
          currency?: string | null;
          created_by?: string | null;
        };
      };
      experiences: {
        Row: {
          id: string;
          title: string;
          description: string;
          location: string;
          price_per_person: number;
          rating: number;
          reviews_count: number;
          image_urls: string[];
          features: string[];
          duration_hours: number;
          max_capacity: number;
          category: string;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location: string;
          price_per_person: number;
          rating?: number;
          reviews_count?: number;
          image_urls?: string[];
          features?: string[];
          duration_hours: number;
          max_capacity: number;
          category: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          location?: string;
          price_per_person?: number;
          rating?: number;
          reviews_count?: number;
          image_urls?: string[];
          features?: string[];
          duration_hours?: number;
          max_capacity?: number;
          category?: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      packages: {
        Row: {
          id: string;
          destination_id: string;
          title: string;
          slug: string | null;
          summary: string | null;
          description: string | null;
          category: string | null;
          lead_partner_id: string | null;
          duration_days: number | null;
          group_size_limit: number | null;
          inclusions: any;
          exclusions: any;
          itinerary: any;
          base_price: number;
          currency: string;
          discount_percent: number | null;
          featured: boolean | null;
          luxury_certified: boolean | null;
          avg_rating: number | null;
          review_count: number | null;
          availability: any | null;
          is_published: boolean | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          destination_id: string;
          title: string;
          slug?: string | null;
          summary?: string | null;
          description?: string | null;
          category?: string | null;
          lead_partner_id?: string | null;
          duration_days?: number | null;
          group_size_limit?: number | null;
          inclusions?: any;
          exclusions?: any;
          itinerary?: any;
          base_price: number;
          currency?: string;
          discount_percent?: number | null;
          featured?: boolean | null;
          luxury_certified?: boolean | null;
          avg_rating?: number | null;
          review_count?: number | null;
          availability?: any | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          destination_id?: string;
          title?: string;
          slug?: string | null;
          summary?: string | null;
          description?: string | null;
          category?: string | null;
          lead_partner_id?: string | null;
          duration_days?: number | null;
          group_size_limit?: number | null;
          inclusions?: any;
          exclusions?: any;
          itinerary?: any;
          base_price?: number;
          currency?: string;
          discount_percent?: number | null;
          featured?: boolean | null;
          luxury_certified?: boolean | null;
          avg_rating?: number | null;
          review_count?: number | null;
          availability?: any | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          start_date: string;
          end_date: string;
          traveler_count: number;
          concierge: boolean;
          pricing_breakdown: any;
          total_price: number;
          status: string;
          payment_status: string;
          payment_reference: string | null;
          qr_code_url: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id: string;
          start_date: string;
          end_date: string;
          traveler_count: number;
          concierge?: boolean;
          pricing_breakdown?: any;
          total_price: number;
          status?: string;
          payment_status?: string;
          payment_reference?: string | null;
          qr_code_url?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string;
          start_date?: string;
          end_date?: string;
          traveler_count?: number;
          concierge?: boolean;
          pricing_breakdown?: any;
          total_price?: number;
          status?: string;
          payment_status?: string;
          payment_reference?: string | null;
          qr_code_url?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string | null;
          order_index: number | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: string | null;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      package_experiences: {
        Row: {
          id: string;
          package_id: string;
          experience_id: string;
          sort_order: number;
          is_optional: boolean;
          is_included_in_price: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          package_id: string;
          experience_id: string;
          sort_order?: number;
          is_optional?: boolean;
          is_included_in_price?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          package_id?: string;
          experience_id?: string;
          sort_order?: number;
          is_optional?: boolean;
          is_included_in_price?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
  };
}
