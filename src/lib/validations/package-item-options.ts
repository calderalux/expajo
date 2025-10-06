import { z } from 'zod';

export const packageItemOptionCreateSchema = z.object({
  package_item_id: z.string().uuid('Valid package item ID is required'),
  name: z.string().min(1, 'Option name is required'),
  description: z.string().nullable().optional(),
  price: z.number().min(0, 'Price must be non-negative').default(0),
  meta: z.any().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const packageItemOptionUpdateSchema = packageItemOptionCreateSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export const packageItemOptionFiltersSchema = z.object({
  package_item_id: z.string().uuid().optional(),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_by: z.enum(['name', 'price', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).default(50),
  offset: z.number().int().min(0).default(0),
});

export type PackageItemOptionCreateData = z.infer<typeof packageItemOptionCreateSchema>;
export type PackageItemOptionUpdateData = z.infer<typeof packageItemOptionUpdateSchema>;
export type PackageItemOptionFilters = z.infer<typeof packageItemOptionFiltersSchema>;
