import { createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { PackageItemOptionFilters } from '@/lib/validations/package-item-options';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

export type PackageItemOption = Database['public']['Tables']['package_item_options']['Row'];

export interface PackageItemOptionListResponse {
  data: PackageItemOption[];
  pagination: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export class PackageItemOptionService {
  private static client = createServerClient();

  // Get all package item options with filters and caching
  static async getPackageItemOptions(filters: Partial<PackageItemOptionFilters> = {}): Promise<PackageItemOptionListResponse> {
    const {
      package_item_id,
      search,
      is_active,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    // Create cache key
    const cacheKey = CacheKeys.packageItemOptions.all(filters, undefined, limit);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        let query = this.client
          .from('package_item_options')
          .select('*', { count: 'exact' })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (package_item_id) {
          query = query.eq('package_item_id', package_item_id);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (is_active !== undefined) {
          query = query.eq('is_active', is_active);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, error, count } = await query;

        if (error) {
          throw new Error(`Failed to fetch package item options: ${error.message}`);
        }

        return {
          data: data || [],
          pagination: {
            total: count || 0,
            hasMore: (offset + limit) < (count || 0),
            limit,
            offset,
          },
        };
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageItemOptions],
      }
    );
  }

  // Get package item option by ID with caching
  static async getPackageItemOptionById(id: string): Promise<PackageItemOption | null> {
    const cacheKey = CacheKeys.packageItemOptions.byId(id);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_item_options')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(`Failed to fetch package item option: ${error.message}`);
        }

        return data;
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packageItemOptions],
      }
    );
  }

  // Get options by package item ID with caching
  static async getOptionsByPackageItem(packageItemId: string): Promise<PackageItemOption[]> {
    const cacheKey = CacheKeys.packageItemOptions.byPackageItem(packageItemId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_item_options')
          .select('*')
          .eq('package_item_id', packageItemId)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch package item options: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packageItemOptions],
      }
    );
  }

  // Create package item option with cache invalidation
  static async createPackageItemOption(option: Omit<PackageItemOption, 'id' | 'created_at' | 'updated_at'>): Promise<PackageItemOption> {
    const { data, error } = await this.client
      .from('package_item_options')
      .insert(option as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create package item option: ${error.message}`);
    }

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);
    // Also invalidate package item cache since it now has options
    await CacheService.invalidateByTags([CacheTags.packageItems]);

    return data;
  }

  // Update package item option with cache invalidation
  static async updatePackageItemOption(id: string, updates: Partial<PackageItemOption>): Promise<PackageItemOption> {
    const { data, error } = await (this.client as any)
      .from('package_item_options')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package item option: ${error.message}`);
    }

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);
    // Also invalidate specific option cache
    await CacheService.delete(CacheKeys.packageItemOptions.byId(id));

    return data;
  }

  // Delete package item option with cache invalidation
  static async deletePackageItemOption(id: string): Promise<void> {
    const { error } = await this.client
      .from('package_item_options')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete package item option: ${error.message}`);
    }

    // Invalidate package item options cache
    await CacheService.invalidateByTags([CacheTags.packageItemOptions]);
    // Also invalidate specific option cache
    await CacheService.delete(CacheKeys.packageItemOptions.byId(id));
  }

  // Search package item options with caching
  static async searchPackageItemOptions(searchTerm: string): Promise<PackageItemOption[]> {
    const cacheKey = CacheKeys.packageItemOptions.search(searchTerm);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_item_options')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to search package item options: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageItemOptions],
      }
    );
  }
}
