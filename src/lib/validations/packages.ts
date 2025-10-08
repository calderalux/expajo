import { z } from 'zod';

export const packageCreateSchema = z.object({
  destination_id: z.string().uuid('Valid destination ID is required'),
  title: z.string().min(1, 'Package title is required'),
  slug: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  lead_partner_id: z.string().uuid().nullable().optional(),
  duration_days: z.number().int().min(1).nullable().optional(),
  group_size_limit: z.number().int().min(1).nullable().optional(),
  inclusions: z.any().nullable().optional(),
  exclusions: z.any().nullable().optional(),
  itinerary: z.any().nullable().optional(),
  base_price: z.number().min(0, 'Base price must be non-negative'),
  currency: z.string().default('USD'),
  discount_percent: z.number().min(0).max(100).nullable().optional(),
  featured: z.boolean().default(false),
  luxury_certified: z.boolean().default(false),
  avg_rating: z.number().min(0).max(5).nullable().optional(),
  review_count: z.number().int().min(0).nullable().optional(),
  availability: z.any().nullable().optional(),
  is_published: z.boolean().default(false),
});

export const packageUpdateSchema = packageCreateSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export const packageFiltersSchema = z.object({
  destination_id: z.string().uuid().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  sort_by: z
    .enum(['title', 'base_price', 'created_at', 'updated_at', 'avg_rating'])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).default(50),
  offset: z.number().int().min(0).default(0),
});

export type PackageCreateData = z.infer<typeof packageCreateSchema>;
export type PackageUpdateData = z.infer<typeof packageUpdateSchema>;
export type PackageFilters = z.infer<typeof packageFiltersSchema>;

// Package categories for form options
export const packageCategories = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'beach', label: 'Beach' },
  { value: 'city', label: 'City' },
  { value: 'nature', label: 'Nature' },
];

// Currency options for form
export const currencies = [
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
  { value: 'CAD', label: 'CAD (Canadian Dollar)' },
  { value: 'AUD', label: 'AUD (Australian Dollar)' },
];
