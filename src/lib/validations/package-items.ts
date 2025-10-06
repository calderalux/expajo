import { z } from 'zod';
import { ServiceType } from '@/types/database';

// Package Item Create Schema
export const packageItemCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  item_type: z.nativeEnum(ServiceType, {
    errorMap: () => ({ message: 'Invalid item type' })
  }),
});

// Package Item Update Schema
export const packageItemUpdateSchema = packageItemCreateSchema.partial().extend({
  id: z.string().uuid('Invalid ID format'),
});

// Package Item Filters Schema
export const packageItemFiltersSchema = z.object({
  search: z.string().optional(),
  item_type: z.nativeEnum(ServiceType).optional(),
  sort_by: z.enum(['name', 'item_type', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Type exports
export type PackageItemCreateData = z.infer<typeof packageItemCreateSchema>;
export type PackageItemUpdateData = z.infer<typeof packageItemUpdateSchema>;
export type PackageItemFilters = z.infer<typeof packageItemFiltersSchema>;

// Service type options for forms
export const serviceTypeOptions = Object.values(ServiceType).map(type => ({
  value: type,
  label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));
