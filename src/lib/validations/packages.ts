import { z } from 'zod';
import { PackageCategory, CurrencyEnum } from '@/lib/supabase';

// Package validation schema
export const packageCreateSchema = z.object({
  destination_id: z.string()
    .min(1, 'Destination ID is required')
    .uuid('Destination ID must be a valid UUID'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  summary: z.string()
    .max(200, 'Summary must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.nativeEnum(PackageCategory),
  lead_partner_id: z.string()
    .uuid('Lead partner ID must be a valid UUID'),
  duration_days: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  group_size_limit: z.number()
    .min(1, 'Group size limit must be at least 1')
    .max(100, 'Group size limit cannot exceed 100'),
  inclusions: z.array(z.string().min(1, 'Inclusion cannot be empty'))
    .max(50, 'Maximum 50 inclusions allowed'),
  exclusions: z.array(z.string().min(1, 'Exclusion cannot be empty'))
    .max(50, 'Maximum 50 exclusions allowed'),
  itinerary: z.array(z.any())
    .max(100, 'Maximum 100 itinerary items allowed'),
  base_price: z.number()
    .min(0, 'Base price must be non-negative')
    .max(1000000, 'Base price cannot exceed 1,000,000'),
  currency: z.nativeEnum(CurrencyEnum),
  discount_percent: z.number()
    .min(0, 'Discount percent must be non-negative')
    .max(100, 'Discount percent cannot exceed 100'),
  featured: z.boolean(),
  luxury_certified: z.boolean(),
  availability: z.any(),
  is_published: z.boolean(),
});

export const packageUpdateSchema = packageCreateSchema.partial();

// Package categories
export const packageCategories: Array<{ value: string; label: string }> = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'beach', label: 'Beach' },
  { value: 'city', label: 'City' },
  { value: 'nature', label: 'Nature' },
];

// Currencies
export const currencies: Array<{ value: string; label: string }> = [
  { value: 'USD', label: 'USD' },
  { value: 'NGN', label: 'NGN' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

// Type exports
export type PackageCreateData = z.infer<typeof packageCreateSchema>;
export type PackageUpdateData = z.infer<typeof packageUpdateSchema>;
