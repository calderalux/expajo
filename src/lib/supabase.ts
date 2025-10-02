import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (bypasses RLS)
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  
  return createClient(supabaseUrl, serviceKey);
};

// Database enums
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PartnerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

export enum MembershipTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip'
}

export enum CurrencyEnum {
  USD = 'USD',
  NGN = 'NGN',
  EUR = 'EUR',
  GBP = 'GBP'
}

export enum PackageCategory {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  LUXURY = 'luxury',
  BEACH = 'beach',
  CITY = 'city',
  NATURE = 'nature'
}

export enum ItemType {
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  ACTIVITY = 'activity',
  MEAL = 'meal',
  GUIDE = 'guide',
  EQUIPMENT = 'equipment'
}

// Database types
export interface Database {
  public: {
    Tables: {
      app_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'super_admin' | 'admin' | 'staff' | 'partner' | 'guest';
          permissions: any;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'super_admin' | 'admin' | 'staff' | 'partner' | 'guest';
          permissions?: any;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'super_admin' | 'admin' | 'staff' | 'partner' | 'guest';
          permissions?: any;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          is_active?: boolean;
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
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          category: string;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          phone: string | null;
          membership: MembershipTier;
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
          membership?: MembershipTier;
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
          membership?: MembershipTier;
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
          status: BookingStatus;
          payment_status: PaymentStatus;
          payment_reference: string | null;
          qr_code_url: string | null;
          created_at: string;
          updated_at: string;
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
          status?: BookingStatus;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          qr_code_url?: string | null;
          created_at?: string;
          updated_at?: string;
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
          status?: BookingStatus;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          qr_code_url?: string | null;
          created_at?: string;
          updated_at?: string;
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
          item_type: ItemType;
          option_id: string | null;
          partner_name: string | null;
          role: string | null;
          is_included: boolean;
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
          item_type: ItemType;
          option_id?: string | null;
          partner_name?: string | null;
          role?: string | null;
          is_included?: boolean;
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
          item_type?: ItemType;
          option_id?: string | null;
          partner_name?: string | null;
          role?: string | null;
          is_included?: boolean;
          unit_price_usd?: number;
          quantity?: number;
          subtotal_usd?: number | null;
          created_at?: string;
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
          highlights: string[] | null;
          best_time_to_visit: string | null;
          climate: string | null;
          language: string | null;
          avg_rating: number | null;
          review_count: number | null;
          package_count: number | null;
          featured: boolean | null;
          is_published: boolean | null;
          created_at: string;
          updated_at: string;
          currency: string | null;
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
          highlights?: string[] | null;
          best_time_to_visit?: string | null;
          climate?: string | null;
          language?: string | null;
          avg_rating?: number | null;
          review_count?: number | null;
          package_count?: number | null;
          featured?: boolean | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          currency?: string | null;
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
          highlights?: string[] | null;
          best_time_to_visit?: string | null;
          climate?: string | null;
          language?: string | null;
          avg_rating?: number | null;
          review_count?: number | null;
          package_count?: number | null;
          featured?: boolean | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          currency?: string | null;
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
          item_type: ItemType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          item_type: ItemType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          item_type?: ItemType;
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
          item_type: ItemType;
          option_id: string | null;
          role: string | null;
          is_included: boolean | null;
          usd_price_override: number | null;
          commission_rate: number | null;
          capacity_per_day: number | null;
          service_window: any | null;
          notes: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          partner_id: string;
          item_type: ItemType;
          option_id?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          usd_price_override?: number | null;
          commission_rate?: number | null;
          capacity_per_day?: number | null;
          service_window?: any | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          partner_id?: string;
          item_type?: ItemType;
          option_id?: string | null;
          role?: string | null;
          is_included?: boolean | null;
          usd_price_override?: number | null;
          commission_rate?: number | null;
          capacity_per_day?: number | null;
          service_window?: any | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
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
          category: PackageCategory | null;
          lead_partner_id: string | null;
          duration_days: number | null;
          group_size_limit: number | null;
          inclusions: any;
          exclusions: any;
          itinerary: any;
          base_price: number;
          currency: CurrencyEnum;
          discount_percent: number | null;
          featured: boolean | null;
          luxury_certified: boolean | null;
          avg_rating: number | null;
          review_count: number | null;
          availability: any | null;
          is_published: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          destination_id: string;
          title: string;
          slug?: string | null;
          summary?: string | null;
          description?: string | null;
          category?: PackageCategory | null;
          lead_partner_id?: string | null;
          duration_days?: number | null;
          group_size_limit?: number | null;
          inclusions?: any;
          exclusions?: any;
          itinerary?: any;
          base_price: number;
          currency?: CurrencyEnum;
          discount_percent?: number | null;
          featured?: boolean | null;
          luxury_certified?: boolean | null;
          avg_rating?: number | null;
          review_count?: number | null;
          availability?: any | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination_id?: string;
          title?: string;
          slug?: string | null;
          summary?: string | null;
          description?: string | null;
          category?: PackageCategory | null;
          lead_partner_id?: string | null;
          duration_days?: number | null;
          group_size_limit?: number | null;
          inclusions?: any;
          exclusions?: any;
          itinerary?: any;
          base_price?: number;
          currency?: CurrencyEnum;
          discount_percent?: number | null;
          featured?: boolean | null;
          luxury_certified?: boolean | null;
          avg_rating?: number | null;
          review_count?: number | null;
          availability?: any | null;
          is_published?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          status: PartnerStatus;
          logo_url: string | null;
          website: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string | null;
          status?: PartnerStatus;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string | null;
          status?: PartnerStatus;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
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
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          package_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          package_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
