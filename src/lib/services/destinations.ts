import { supabase, createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { CacheService, CacheKeys, CacheTags } from './cache';

type Destination = Database['public']['Tables']['destinations']['Row'];
type DestinationInsert = Database['public']['Tables']['destinations']['Insert'];
type DestinationUpdate = Database['public']['Tables']['destinations']['Update'];

export interface DestinationFilters {
  country?: string;
  region?: string;
  featured?: boolean;
  isPublished?: boolean;
}

export interface DestinationSortOptions {
  field: 'created_at' | 'name' | 'region' | 'avg_rating' | 'package_count';
  order: 'asc' | 'desc';
}

export class DestinationService {
  /**
   * Get all destinations with optional filtering and sorting
   */
  static async getDestinations(
    filters?: DestinationFilters,
    sort?: DestinationSortOptions,
    limit?: number
  ) {
    const cacheKey = CacheKeys.destinations.all(filters, sort, limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        // Use server client to bypass RLS for public data
        const serverClient = createServerClient();
        let query = serverClient
          .from('destinations')
          .select('*')
          .eq('is_published', true);

        // Apply filters
        if (filters) {
          if (filters.country) {
            query = query.eq('country', filters.country);
          }
          if (filters.region) {
            query = query.ilike('region', `%${filters.region}%`);
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured);
          }
          if (filters.isPublished !== undefined) {
            query = query.eq('is_published', filters.isPublished);
          }
        }

        // Apply sorting
        if (sort) {
          query = query.order(sort.field, { ascending: sort.order === 'asc' });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch destinations: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 1800, // 30 minutes
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Get a single destination by ID
   */
  static async getDestinationById(id: string) {
    const cacheKey = CacheKeys.destinations.byId(id);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const serverClient = createServerClient();
        const { data, error } = await serverClient
          .from('destinations')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (error) {
          throw new Error(`Failed to fetch destination: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 3600, // 1 hour
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Get featured destinations
   */
  static async getFeaturedDestinations(limit: number = 6) {
    const cacheKey = CacheKeys.destinations.featured(limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return this.getDestinations(
          { featured: true },
          { field: 'name', order: 'asc' },
          limit
        );
      },
      {
        ttl: 1800, // 30 minutes
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Get destinations by country
   */
  static async getDestinationsByCountry(country: string, limit?: number) {
    const cacheKey = CacheKeys.destinations.byCountry(country, limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return this.getDestinations(
          { country },
          { field: 'name', order: 'asc' },
          limit
        );
      },
      {
        ttl: 1800, // 30 minutes
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Search destinations by title, description, or location
   */
  static async searchDestinations(searchTerm: string, limit?: number) {
    const cacheKey = CacheKeys.destinations.search(searchTerm, limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const serverClient = createServerClient();
        const { data, error } = await serverClient
          .from('destinations')
          .select('*')
          .eq('is_published', true)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(limit || 20);

        if (error) {
          throw new Error(`Failed to search destinations: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 900, // 15 minutes for search results
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Get destination countries
   */
  static async getDestinationCountries() {
    const cacheKey = CacheKeys.destinations.countries();
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const serverClient = createServerClient();
        const { data, error } = await serverClient
          .from('destinations')
          .select('country')
          .eq('is_published', true)
          .not('country', 'is', null);

        if (error) {
          throw new Error(`Failed to fetch countries: ${error.message}`);
        }

        // Get unique countries
        const countries = Array.from(new Set(data.map((item: any) => item.country)));
        return { data: countries, error: null };
      },
      {
        ttl: 3600, // 1 hour
        tags: [CacheTags.destinations],
      }
    );
  }

  /**
   * Create a new destination (admin only)
   */
  static async createDestination(destination: DestinationInsert) {
    const serverClient = createServerClient();
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .insert(destination)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create destination: ${error.message}`);
    }

    // Invalidate destination cache
    await this.invalidateDestinationCache(data.id);

    return { data, error: null };
  }

  /**
   * Update a destination (admin/staff only)
   */
  static async updateDestination(id: string, updates: DestinationUpdate) {
    const serverClient = createServerClient();
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update destination: ${error.message}`);
    }

    // Invalidate destination cache
    await this.invalidateDestinationCache(data.id);

    return { data, error: null };
  }

  /**
   * Delete a destination (super admin only - hard delete)
   */
  static async deleteDestination(id: string) {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
      .from('destinations')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete destination: ${error.message}`);
    }

    // Invalidate destination cache
    await this.invalidateDestinationCache(id);

    return { data, error: null };
  }

  /**
   * Soft delete a destination (admin only - unpublish)
   */
  static async unpublishDestination(id: string) {
    const serverClient = createServerClient();
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .update({ is_published: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unpublish destination: ${error.message}`);
    }

    // Invalidate destination cache
    await this.invalidateDestinationCache(data.id);

    return { data, error: null };
  }

  /**
   * Get all destinations for admin (including unpublished)
   */
  static async getAllDestinationsForAdmin(
    filters?: DestinationFilters,
    sort?: DestinationSortOptions,
    limit?: number
  ) {
    const cacheKey = `admin:destinations:all:${JSON.stringify({ filters, sort, limit })}`;
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const serverClient = createServerClient();
        let query = serverClient
          .from('destinations')
          .select('*');

        // Apply filters
        if (filters) {
          if (filters.country) {
            query = query.eq('country', filters.country);
          }
          if (filters.region) {
            query = query.ilike('region', `%${filters.region}%`);
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured);
          }
          if (filters.isPublished !== undefined) {
            query = query.eq('is_published', filters.isPublished);
          }
        }

        // Apply sorting
        if (sort) {
          query = query.order(sort.field, { ascending: sort.order === 'asc' });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch destinations: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 300, // 5 minutes for admin data
        tags: [CacheTags.destinations, 'admin-destinations'],
      }
    );
  }

  /**
   * Get destination by ID for admin (including unpublished)
   */
  static async getDestinationByIdForAdmin(id: string) {
    const cacheKey = `admin:destinations:${id}`;
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const serverClient = createServerClient();
        const { data, error } = await serverClient
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw new Error(`Failed to fetch destination: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 300, // 5 minutes for admin data
        tags: [CacheTags.destinations, 'admin-destinations'],
      }
    );
  }

  /**
   * Invalidate specific destination cache by ID
   */
  static async invalidateDestinationCache(id: string): Promise<void> {
    try {
      // Invalidate specific destination caches
      await CacheService.delete(`destinations:${id}`);
      await CacheService.delete(`admin:destinations:${id}`);
      
      // Also invalidate all destination-related caches
      await CacheService.invalidateByTags([CacheTags.destinations, 'admin-destinations']);
    } catch (error) {
      console.error('Failed to invalidate destination cache:', error);
    }
  }

  /**
   * Warm up destination caches (useful for performance optimization)
   */
  static async warmupCaches(): Promise<void> {
    try {
      // Pre-load featured destinations
      await this.getFeaturedDestinations(6);
      
      // Pre-load all destinations
      await this.getDestinations();
      
      // Pre-load countries
      await this.getDestinationCountries();
      
      console.log('Destination caches warmed up successfully');
    } catch (error) {
      console.error('Failed to warm up destination caches:', error);
    }
  }
}

export type { Destination, DestinationInsert, DestinationUpdate };
