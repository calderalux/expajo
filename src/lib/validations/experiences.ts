import { serviceTypeToLabel } from '@/types/database';
import { z } from 'zod';

// Experience validation schema
export const experienceCreateSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  price_per_person: z.number()
    .min(0, 'Price must be non-negative')
    .max(1000000, 'Price cannot exceed 1,000,000'),
  duration_hours: z.number()
    .min(1, 'Duration must be at least 1 hour')
    .max(168, 'Duration cannot exceed 168 hours (1 week)'),
  max_capacity: z.number()
    .min(1, 'Max capacity must be at least 1')
    .max(1000, 'Max capacity cannot exceed 1000'),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters'),
  image_urls: z.array(z.string().url('Please enter a valid URL'))
    .max(10, 'Maximum 10 images allowed'),
  features: z.array(z.string().min(1, 'Feature cannot be empty'))
    .max(20, 'Maximum 20 features allowed'),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial();

// Experience categories
export const experienceCategories = [
  ...Object.values(serviceTypeToLabel),
] as const;

export type ExperienceCategory = typeof experienceCategories[number];

// Type exports
export type ExperienceCreateData = z.infer<typeof experienceCreateSchema>;
export type ExperienceUpdateData = z.infer<typeof experienceUpdateSchema>;
