import { z } from 'zod';

// Base destination schema
export const destinationSchema = z.object({
  name: z.string()
    .min(1, 'Destination name is required')
    .min(2, 'Destination name must be at least 2 characters')
    .max(100, 'Destination name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'.,&()]+$/, 'Destination name contains invalid characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9\-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  country: z.string()
    .min(1, 'Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters'),
  
  country_code: z.string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters')
    .optional(),
  
  region: z.string()
    .min(1, 'Region is required')
    .min(2, 'Region must be at least 2 characters')
    .max(100, 'Region must be less than 100 characters')
    .optional(),
  
  image_cover_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  image_gallery: z.array(z.string().url('Must be a valid URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  
  highlights: z.array(z.string().min(1, 'Highlight cannot be empty'))
    .max(10, 'Maximum 10 highlights allowed')
    .optional(),
  
  best_time_to_visit: z.string()
    .max(200, 'Best time to visit must be less than 200 characters')
    .optional(),
  
  climate: z.string()
    .max(200, 'Climate description must be less than 200 characters')
    .optional(),
  
  language: z.string()
    .max(100, 'Language must be less than 100 characters')
    .optional(),
  
  featured: z.boolean().default(false),
  
  is_published: z.boolean().default(false),
  
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN'], {
    errorMap: () => ({ message: 'Please select a valid currency' })
  }).default('USD'),
});

// Create destination schema (only essential fields required)
export const createDestinationSchema = destinationSchema.pick({
  name: true,
}).extend({
  slug: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  region: z.string().optional(),
  image_cover_url: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  climate: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().default('USD'),
  featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  image_gallery: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

// Update destination schema (all fields optional except ID)
export const updateDestinationSchema = destinationSchema.partial().extend({
  id: z.string().uuid('Invalid destination ID'),
});

// Form field schemas for individual validation
export const destinationFormSchemas = {
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z.string().regex(/^[a-z0-9\-]+$/, 'Invalid slug format').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  country: z.string().min(1, 'Country is required').max(100, 'Country too long'),
  country_code: z.string().length(2, 'Country code must be 2 characters').optional(),
  region: z.string().max(100, 'Region too long').optional(),
  image_cover_url: z.string().url('Invalid URL').optional(),
  highlights: z.array(z.string()).max(10, 'Too many highlights').optional(),
  best_time_to_visit: z.string().max(200, 'Too long').optional(),
  climate: z.string().max(200, 'Too long').optional(),
  language: z.string().max(100, 'Too long').optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN']).default('USD'),
};

// Type exports
export type DestinationFormData = z.infer<typeof destinationSchema>;
export type CreateDestinationData = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationData = z.infer<typeof updateDestinationSchema>;

// Validation helpers
export const validateDestinationName = (name: string) => {
  return destinationFormSchemas.name.safeParse(name);
};

export const validateDestinationSlug = (slug: string) => {
  return destinationFormSchemas.slug.safeParse(slug);
};

export const validateImageUrl = (url: string) => {
  return destinationFormSchemas.image_cover_url.safeParse(url);
};

// Auto-generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};
