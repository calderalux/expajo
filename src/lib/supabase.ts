import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Singleton service client for better performance
let serverClientInstance: ReturnType<typeof createClient<Database>> | null =
  null;

// Server-side Supabase client (bypasses RLS) - Singleton pattern
export const createServerClient = () => {
  if (serverClientInstance) {
    return serverClientInstance;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.error(
      'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables'
    );
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations'
    );
  }

  serverClientInstance = createClient<Database>(supabaseUrl, serviceKey);
  return serverClientInstance;
};

// Database enums
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PartnerStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum MembershipTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
  BLACK = 'black',
}

export enum CurrencyEnum {
  USD = 'USD',
}

export enum PackageCategory {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  LUXURY = 'luxury',
  BEACH = 'beach',
  CITY = 'city',
  NATURE = 'nature',
}

export enum ItemType {
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
