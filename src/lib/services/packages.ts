import { createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { PackageFilters } from '@/lib/validations/packages';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

export type Package = Database['public']['Tables']['packages']['Row'];

export interface PackageListResponse {
  data: Package[];
  pagination: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export interface PackageWithRelations extends Package {
  destination?: {
    id: string;
    name: string;
    country: string;
    image_cover_url: string | null;
  };
  experiences?: Array<{
    id: string;
    experience_id: string;
    is_optional: boolean;
    is_included_in_price: boolean;
    sort_order: number;
    experience: {
      id: string;
      title: string;
      description: string;
      price_per_person: number;
      duration_hours: number;
      location: string;
      category: string;
      image_urls: string[];
    };
  }>;
  option_mappings?: Array<{
    id: string;
    option_id: string;
    package_item_option: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      package_item_id: string;
      is_active: boolean | null;
    };
  }>;
}

export class PackageService {
  private static client = createServerClient();

  // Get all packages with filters and caching
  static async getPackages(filters: Partial<PackageFilters> = {}): Promise<PackageListResponse> {
    const {
      destination_id,
      search,
      category,
      featured,
      is_published,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    // Create cache key
    const cacheKey = CacheKeys.packages.all(filters, undefined, limit);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        let query = this.client
          .from('packages')
          .select('*', { count: 'exact' })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (destination_id) {
          query = query.eq('destination_id', destination_id);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (category) {
          query = query.eq('category', category);
        }
        if (featured !== undefined) {
          query = query.eq('featured', featured);
        }
        if (is_published !== undefined) {
          query = query.eq('is_published', is_published);
        }
        if (min_price !== undefined) {
          query = query.gte('base_price', min_price);
        }
        if (max_price !== undefined) {
          query = query.lte('base_price', max_price);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, error, count } = await query;

        if (error) {
          throw new Error(`Failed to fetch packages: ${error.message}`);
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
        tags: [CacheTags.packages],
      }
    );
  }

  // Get package by ID with caching
  static async getPackageById(id: string): Promise<Package | null> {
    const cacheKey = CacheKeys.packages.byId(id);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(`Failed to fetch package: ${error.message}`);
        }

        return data;
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  // Get packages by destination with caching
  static async getPackagesByDestination(destinationId: string): Promise<Package[]> {
    const cacheKey = CacheKeys.packages.byDestination(destinationId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('packages')
          .select('*')
          .eq('destination_id', destinationId)
          .eq('is_published', true)
          .order('title', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch packages by destination: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  // Get featured packages with caching
  static async getFeaturedPackages(limit: number = 10): Promise<Package[]> {
    const cacheKey = CacheKeys.packages.featured(limit);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('packages')
          .select('*')
          .eq('featured', true)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw new Error(`Failed to fetch featured packages: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  // Create package with cache invalidation
  static async createPackage(pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package> {
    // Debug logging
    console.log('PackageService.createPackage called with:', JSON.stringify(pkg, null, 2));
    
    const { data, error } = await this.client
      .from('packages')
      .insert(pkg as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create package: ${error.message}`);
    }

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);
    // Also invalidate destinations cache since packages are related
    await CacheService.invalidateByTags([CacheTags.destinations]);

    return data;
  }

  // Update package with cache invalidation
  static async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    const { data, error } = await (this.client as any)
      .from('packages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package: ${error.message}`);
    }

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);
    // Also invalidate specific package cache
    await CacheService.delete(CacheKeys.packages.byId(id));

    return data;
  }

  // Delete package with cache invalidation
  static async deletePackage(id: string): Promise<void> {
    const { error } = await this.client
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete package: ${error.message}`);
    }

    // Invalidate packages cache
    await CacheService.invalidateByTags([CacheTags.packages]);
    // Also invalidate specific package cache
    await CacheService.delete(CacheKeys.packages.byId(id));
  }

  // Search packages with caching
  static async searchPackages(searchTerm: string): Promise<Package[]> {
    const cacheKey = CacheKeys.packages.search(searchTerm);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('packages')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('title', { ascending: true });

        if (error) {
          throw new Error(`Failed to search packages: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  // Get package by ID with relationships
  static async getPackageWithRelations(id: string): Promise<PackageWithRelations | null> {
    const cacheKey = `packages:with_relations:${id}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('packages')
          .select(`
            *,
            destination:destinations(
              id,
              name,
              country,
              image_cover_url
            ),
            package_experiences(
              id,
              experience_id,
              is_optional,
              is_included_in_price,
              sort_order,
              experience:experiences(
                id,
                title,
                description,
                price_per_person,
                duration_hours,
                location,
                category,
                image_urls
              )
            ),
            package_option_mappings(
              id,
              option_id,
              package_item_option:package_item_options(
                id,
                name,
                description,
                price,
                package_item_id,
                is_active
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(`Failed to fetch package with relations: ${error.message}`);
        }

        return {
          ...(data as any),
          experiences: (data as any).package_experiences || [],
          option_mappings: (data as any).package_option_mappings || [],
        } as PackageWithRelations;
      },
      {
        ttl: 600, // 10 minutes
        tags: [CacheTags.packages, CacheTags.packageExperiences, CacheTags.packageOptionMappings],
      }
    );
  }

  // Get packages with relationships
  static async getPackagesWithRelations(filters: Partial<PackageFilters> = {}): Promise<PackageWithRelations[]> {
    const {
      destination_id,
      search,
      category,
      featured,
      is_published,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    const cacheKey = `packages:with_relations:${JSON.stringify({ filters, limit, offset })}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        let query = this.client
          .from('packages')
          .select(`
            *,
            destination:destinations(
              id,
              name,
              country,
              image_cover_url
            ),
            package_experiences(
              id,
              experience_id,
              is_optional,
              is_included_in_price,
              sort_order,
              experience:experiences(
                id,
                title,
                description,
                price_per_person,
                duration_hours,
                location,
                category,
                image_urls
              )
            ),
            package_option_mappings(
              id,
              option_id,
              package_item_option:package_item_options(
                id,
                name,
                description,
                price,
                package_item_id,
                is_active
              )
            )
          `)
          .range(offset, offset + limit - 1);

        // Apply filters
        if (destination_id) {
          query = query.eq('destination_id', destination_id);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (featured !== undefined) {
          query = query.eq('featured', featured);
        }

        if (is_published !== undefined) {
          query = query.eq('is_published', is_published);
        }

        if (min_price !== undefined) {
          query = query.gte('base_price', min_price);
        }

        if (max_price !== undefined) {
          query = query.lte('base_price', max_price);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch packages with relations: ${error.message}`);
        }

        return (data || []).map(pkg => ({
          ...(pkg as any),
          experiences: (pkg as any).package_experiences || [],
          option_mappings: (pkg as any).package_option_mappings || [],
        })) as PackageWithRelations[];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packages, CacheTags.packageExperiences, CacheTags.packageOptionMappings],
      }
    );
  }
}