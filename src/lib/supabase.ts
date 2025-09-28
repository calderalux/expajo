import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          price_per_month: number;
          location: string;
          images: string[];
          amenities: string[];
          host_id: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price_per_month: number;
          location: string;
          images: string[];
          amenities: string[];
          host_id: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price_per_month?: number;
          location?: string;
          images?: string[];
          amenities?: string[];
          host_id?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          start_date?: string;
          end_date?: string;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
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
                  status: string;
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
                  status?: string;
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
                  status?: string;
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
                  category: 'adventure' | 'cultural' | 'luxury' | 'beach' | 'city' | 'nature' | null;
                  lead_partner_id: string | null;
                  duration_days: number | null;
                  group_size_limit: number | null;
                  inclusions: any[] | null;
                  exclusions: any[] | null;
                  itinerary: any[] | null;
                  base_price: number;
                  currency: 'USD' | 'NGN' | 'EUR' | 'GBP';
                  discount_percent: number | null;
                  featured: boolean | null;
                  luxury_certified: boolean | null;
                  avg_rating: number | null;
                  review_count: number | null;
                  availability: any | null;
                  is_published: boolean | null;
                  created_at: string | null;
                  updated_at: string | null;
                };
                Insert: {
                  id?: string;
                  destination_id: string;
                  title: string;
                  slug?: string | null;
                  summary?: string | null;
                  description?: string | null;
                  category?: 'adventure' | 'cultural' | 'luxury' | 'beach' | 'city' | 'nature' | null;
                  lead_partner_id?: string | null;
                  duration_days?: number | null;
                  group_size_limit?: number | null;
                  inclusions?: any[] | null;
                  exclusions?: any[] | null;
                  itinerary?: any[] | null;
                  base_price: number;
                  currency?: 'USD' | 'NGN' | 'EUR' | 'GBP';
                  discount_percent?: number | null;
                  featured?: boolean | null;
                  luxury_certified?: boolean | null;
                  avg_rating?: number | null;
                  review_count?: number | null;
                  availability?: any | null;
                  is_published?: boolean | null;
                  created_at?: string | null;
                  updated_at?: string | null;
                };
                Update: {
                  id?: string;
                  destination_id?: string;
                  title?: string;
                  slug?: string | null;
                  summary?: string | null;
                  description?: string | null;
                  category?: 'adventure' | 'cultural' | 'luxury' | 'beach' | 'city' | 'nature' | null;
                  lead_partner_id?: string | null;
                  duration_days?: number | null;
                  group_size_limit?: number | null;
                  inclusions?: any[] | null;
                  exclusions?: any[] | null;
                  itinerary?: any[] | null;
                  base_price?: number;
                  currency?: 'USD' | 'NGN' | 'EUR' | 'GBP';
                  discount_percent?: number | null;
                  featured?: boolean | null;
                  luxury_certified?: boolean | null;
                  avg_rating?: number | null;
                  review_count?: number | null;
                  availability?: any | null;
                  is_published?: boolean | null;
                  created_at?: string | null;
                  updated_at?: string | null;
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
                  created_at: string | null;
                };
                Insert: {
                  id?: string;
                  booking_id: string;
                  user_id: string;
                  package_id: string;
                  rating: number;
                  comment?: string | null;
                  created_at?: string | null;
                };
                Update: {
                  id?: string;
                  booking_id?: string;
                  user_id?: string;
                  package_id?: string;
                  rating?: number;
                  comment?: string | null;
                  created_at?: string | null;
                };
              };
              destinations: {
                Row: {
                  id: string;
                  title: string;
                  description: string;
                  location: string;
                  country: string;
                  image_urls: string[];
                  highlights: string[];
                  best_time_to_visit: string;
                  climate: string;
                  currency: string;
                  language: string;
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
                  country: string;
                  image_urls?: string[];
                  highlights?: string[];
                  best_time_to_visit: string;
                  climate: string;
                  currency: string;
                  language: string;
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
                  country?: string;
                  image_urls?: string[];
                  highlights?: string[];
                  best_time_to_visit?: string;
                  climate?: string;
                  currency?: string;
                  language?: string;
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
                  category: string;
                  order_index: number;
                  is_active: boolean;
                  created_at: string;
                  updated_at: string;
                };
                Insert: {
                  id?: string;
                  question: string;
                  answer: string;
                  category?: string;
                  order_index?: number;
                  is_active?: boolean;
                  created_at?: string;
                  updated_at?: string;
                };
                Update: {
                  id?: string;
                  question?: string;
                  answer?: string;
                  category?: string;
                  order_index?: number;
                  is_active?: boolean;
                  created_at?: string;
                  updated_at?: string;
                };
              };
    };
  };
}
