import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Singleton service client for better performance
let serverClientInstance: ReturnType<typeof createClient<Database>> | null = null;

// Server-side Supabase client (bypasses RLS) - Singleton pattern
export const createServerClient = () => {
  if (serverClientInstance) {
    return serverClientInstance;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  
  serverClientInstance = createClient<Database>(supabaseUrl, serviceKey);
  return serverClientInstance;
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

