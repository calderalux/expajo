import { createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { PackageItemFilters } from '@/lib/validations/package-items';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

export type PackageItem = Database['public']['Tables']['package_items']['Row'];

export interface PackageItemListResponse {
  data: PackageItem[];
  pagination: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export class PackageItemService {
  private static client = createServerClient();

  // Get all package items with filters and caching
  static async getPackageItems(filters: Partial<PackageItemFilters> = {}): Promise<PackageItemListResponse> {
    const {
      search,
      item_type,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    // Create cache key
    const cacheKey = CacheKeys.packageItems.all(filters, undefined, limit);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        let query = this.client
          .from('package_items')
          .select('*', { count: 'exact' })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`);
        }

        if (item_type) {
          query = query.eq('item_type', item_type);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, error, count } = await query;

        if (error) {
          throw new Error(`Failed to fetch package items: ${error.message}`);
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
        tags: [CacheTags.packageItems],
      }
    );
  }

  // Get package item by ID with caching
  static async getPackageItemById(id: string): Promise<PackageItem | null> {
    const cacheKey = CacheKeys.packageItems.byId(id);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(`Failed to fetch package item: ${error.message}`);
        }

        return data;
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packageItems],
      }
    );
  }

  // Create package item with cache invalidation
  static async createPackageItem(item: Omit<PackageItem, 'id' | 'created_at' | 'updated_at'>): Promise<PackageItem> {
    const { data, error } = await this.client
      .from('package_items')
      .insert(item as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create package item: ${error.message}`);
    }

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);

    return data;
  }

  // Update package item with cache invalidation
  static async updatePackageItem(id: string, updates: Partial<PackageItem>): Promise<PackageItem> {
    const { data, error } = await (this.client as any)
      .from('package_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package item: ${error.message}`);
    }

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);
    // Also invalidate specific item cache
    await CacheService.delete(CacheKeys.packageItems.byId(id));

    return data;
  }

  // Delete package item with cache invalidation
  static async deletePackageItem(id: string): Promise<void> {
    const { error } = await this.client
      .from('package_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete package item: ${error.message}`);
    }

    // Invalidate package items cache
    await CacheService.invalidateByTags([CacheTags.packageItems]);
    // Also invalidate specific item cache
    await CacheService.delete(CacheKeys.packageItems.byId(id));
  }

  // Get package items by type with caching
  static async getPackageItemsByType(itemType: string): Promise<PackageItem[]> {
    const cacheKey = CacheKeys.packageItems.byType(itemType);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_items')
          .select('*')
          .eq('item_type', itemType)
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch package items by type: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packageItems],
      }
    );
  }

  // Search package items with caching
  static async searchPackageItems(searchTerm: string): Promise<PackageItem[]> {
    const cacheKey = CacheKeys.packageItems.search(searchTerm);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_items')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to search package items: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageItems],
      }
    );
  }
}
