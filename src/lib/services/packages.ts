import { supabase, createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { PackageCategory, CurrencyEnum } from '@/lib/supabase';
import { CacheService, CacheKeys, CacheTags } from './cache';

type Package = Database['public']['Tables']['packages']['Row'];
type PackageInsert = Database['public']['Tables']['packages']['Insert'];
type PackageUpdate = Database['public']['Tables']['packages']['Update'];

export interface PackageFilters {
  destination_id?: string;
  category?: PackageCategory;
  featured?: boolean;
  luxury_certified?: boolean;
  isPublished?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  currency?: CurrencyEnum;
}

export interface PackageSortOptions {
  field: 'created_at' | 'title' | 'base_price' | 'avg_rating' | 'review_count';
  order: 'asc' | 'desc';
}

export class PackageService {
  /**
   * Get all packages with optional filtering and sorting (public - only published)
   */
  static async getPackages(
    filters?: PackageFilters,
    sort?: PackageSortOptions,
    limit?: number
  ) {
    const cacheKey = CacheKeys.packages.all(filters, sort, limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        // Use service role client for public queries to bypass RLS
        // This prevents circular dependency issues with RLS policies
        const serverClient = createServerClient();
        
        let query = serverClient
          .from('packages')
          .select(`
            *,
            destinations (
              id,
              name,
              slug,
              country,
              region,
              image_cover_url
            ),
            partners!packages_lead_partner_id_fkey (
              id,
              name,
              logo_url,
              rating
            )
          `)
          .eq('is_published', true);

        // Apply filters
        if (filters) {
          if (filters.destination_id) {
            query = query.eq('destination_id', filters.destination_id);
          }
          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured);
          }
          if (filters.luxury_certified !== undefined) {
            query = query.eq('luxury_certified', filters.luxury_certified);
          }
          if (filters.isPublished !== undefined) {
            query = query.eq('is_published', filters.isPublished);
          }
          if (filters.minPrice !== undefined) {
            query = query.gte('base_price', filters.minPrice);
          }
          if (filters.maxPrice !== undefined) {
            query = query.lte('base_price', filters.maxPrice);
          }
          if (filters.minRating !== undefined) {
            query = query.gte('avg_rating', filters.minRating);
          }
          if (filters.currency) {
            query = query.eq('currency', filters.currency);
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
          throw new Error(`Failed to fetch packages: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 1800, // 30 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  /**
   * Get all packages for admin operations (includes unpublished packages)
   */
  static async getPackagesForAdmin(
    filters?: PackageFilters,
    sort?: PackageSortOptions,
    limit?: number
  ) {
    const cacheKey = CacheKeys.packages.all({ ...filters, admin: true }, sort, limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        // Use service role client to bypass RLS for admin queries
        const serverClient = createServerClient();
        
        let query = serverClient
          .from('packages')
          .select(`
            *,
            destinations (
              id,
              name,
              slug,
              country,
              region,
              image_cover_url
            ),
            partners!packages_lead_partner_id_fkey (
              id,
              name,
              logo_url,
              rating
            )
          `);
          // Note: No .eq('is_published', true) for admin operations

        // Apply filters
        if (filters) {
          if (filters.destination_id) {
            query = query.eq('destination_id', filters.destination_id);
          }
          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured);
          }
          if (filters.luxury_certified !== undefined) {
            query = query.eq('luxury_certified', filters.luxury_certified);
          }
          if (filters.isPublished !== undefined) {
            query = query.eq('is_published', filters.isPublished);
          }
          if (filters.minPrice !== undefined) {
            query = query.gte('base_price', filters.minPrice);
          }
          if (filters.maxPrice !== undefined) {
            query = query.lte('base_price', filters.maxPrice);
          }
          if (filters.minRating !== undefined) {
            query = query.gte('avg_rating', filters.minRating);
          }
          if (filters.currency) {
            query = query.eq('currency', filters.currency);
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
          throw new Error(`Failed to fetch packages: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 300, // 5 minutes for admin queries (shorter cache)
        tags: [CacheTags.packages],
      }
    );
  }

  /**
   * Get a single package by ID with full details
   */
  static async getPackageById(id: string) {
    const cacheKey = CacheKeys.packages.byId(id);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('packages')
          .select(`
            *,
            destinations (
              id,
              name,
              slug,
              description,
              country,
              region,
              image_cover_url,
              image_gallery
            ),
            partners!packages_lead_partner_id_fkey (
              id,
              name,
              type,
              logo_url,
              website,
              contact_email,
              contact_phone,
              rating
            ),
            package_partner_services (
              id,
              partner_id,
              item_type,
              role,
              is_included,
              usd_price_override,
              capacity_per_day,
              service_window,
              notes,
              partners (
                id,
                name,
                logo_url,
                rating
              )
            )
          `)
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (error) {
          throw new Error(`Failed to fetch package: ${error.message}`);
        }

        return { data, error: null };
      },
      {
        ttl: 3600, // 1 hour
        tags: [CacheTags.packages],
      }
    );
  }

  /**
   * Get package by slug
   */
  static async getPackageBySlug(slug: string) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        destinations (
          id,
          name,
          slug,
          description,
          country,
          region,
          image_cover_url,
          image_gallery
        ),
        partners!packages_lead_partner_id_fkey (
          id,
          name,
          type,
          logo_url,
          website,
          contact_email,
          contact_phone,
          rating
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch package by slug: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get featured packages
   */
  static async getFeaturedPackages(limit: number = 6) {
    const cacheKey = CacheKeys.packages.featured(limit);
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return this.getPackages(
          { featured: true },
          { field: 'avg_rating', order: 'desc' },
          limit
        );
      },
      {
        ttl: 1800, // 30 minutes
        tags: [CacheTags.packages],
      }
    );
  }

  /**
   * Get packages by destination
   */
  static async getPackagesByDestination(destinationId: string, limit?: number) {
    return this.getPackages(
      { destination_id: destinationId },
      { field: 'base_price', order: 'asc' },
      limit
    );
  }

  /**
   * Get packages by category
   */
  static async getPackagesByCategory(category: PackageCategory, limit?: number) {
    return this.getPackages(
      { category },
      { field: 'avg_rating', order: 'desc' },
      limit
    );
  }

  /**
   * Get luxury certified packages
   */
  static async getLuxuryPackages(limit?: number) {
    return this.getPackages(
      { luxury_certified: true },
      { field: 'base_price', order: 'desc' },
      limit
    );
  }

  /**
   * Search packages by title, description, or destination
   */
  static async searchPackages(searchTerm: string, limit?: number) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        destinations (
          id,
          name,
          slug,
          country,
          region,
          image_cover_url
        )
      `)
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
      .order('avg_rating', { ascending: false })
      .limit(limit || 20);

    if (error) {
      throw new Error(`Failed to search packages: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get package categories
   */
  static async getPackageCategories() {
    const { data, error } = await supabase
      .from('packages')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Get unique categories
    const categories = Array.from(new Set((data as any).map((item: any) => item.category)));
    return { data: categories, error: null };
  }

  /**
   * Calculate package pricing with options
   */
  static async calculatePackagePricing(
    packageId: string,
    travelerCount: number,
    selectedOptions?: string[]
  ) {
    const packageData = await this.getPackageById(packageId);
    if (!packageData.data) {
      throw new Error('Package not found');
    }

    const package_ = packageData.data;
    let totalPrice = (package_ as any).base_price * travelerCount;

    // Apply discount if available
    if ((package_ as any).discount_percent && (package_ as any).discount_percent > 0) {
      totalPrice = totalPrice * (1 - (package_ as any).discount_percent / 100);
    }

    // Add selected options pricing
    if (selectedOptions && selectedOptions.length > 0) {
      const { data: options, error } = await supabase
        .from('package_option_mappings')
        .select(`
          option_id,
          package_item_options (
            id,
            name,
            price
          )
        `)
        .eq('package_id', packageId)
        .in('option_id', selectedOptions);

      if (error) {
        throw new Error(`Failed to fetch package options: ${error.message}`);
      }

      const optionsTotal = (options as any)?.reduce((sum: any, option: any) => {
        const optionPrice = (option as any).package_item_options?.reduce((optSum: any, opt: any) => optSum + (opt.price || 0), 0) || 0;
        return sum + optionPrice * travelerCount;
      }, 0) || 0;

      totalPrice += optionsTotal;
    }

    return {
      basePrice: (package_ as any).base_price,
      travelerCount,
      subtotal: (package_ as any).base_price * travelerCount,
      discountAmount: (package_ as any).discount_percent ? ((package_ as any).base_price * travelerCount * (package_ as any).discount_percent / 100) : 0,
      optionsTotal: selectedOptions ? await this.calculateOptionsTotal(packageId, selectedOptions, travelerCount) : 0,
      totalPrice,
      currency: (package_ as any).currency
    };
  }

  /**
   * Calculate options total
   */
  private static async calculateOptionsTotal(
    packageId: string,
    selectedOptions: string[],
    travelerCount: number
  ) {
    const { data: options, error } = await supabase
      .from('package_option_mappings')
      .select(`
        option_id,
        package_item_options (
          id,
          name,
          price
        )
      `)
      .eq('package_id', packageId)
      .in('option_id', selectedOptions);

    if (error) {
      throw new Error(`Failed to fetch package options: ${error.message}`);
    }

    return (options as any)?.reduce((sum: any, option: any) => {
      const optionPrice = (option as any).package_item_options?.reduce((optSum: any, opt: any) => optSum + (opt.price || 0), 0) || 0;
      return sum + optionPrice * travelerCount;
    }, 0) || 0;
  }

  /**
   * Create a new package (admin only)
   */
  static async createPackage(package_: PackageInsert) {
    const { data, error } = await (supabase as any)
      .from('packages')
      .insert(package_)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create package: ${error.message}`);
    }

    // Invalidate package cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return { data, error: null };
  }

  /**
   * Update a package (admin/staff only)
   */
  static async updatePackage(id: string, updates: PackageUpdate) {
    const { data, error } = await (supabase as any)
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package: ${error.message}`);
    }

    // Invalidate package cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return { data, error: null };
  }

  /**
   * Delete a package (super admin only - hard delete)
   */
  static async deletePackage(id: string) {
    const { data, error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete package: ${error.message}`);
    }

    // Invalidate package cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return { data, error: null };
  }

  /**
   * Soft delete a package by setting is_published to false (admin/staff)
   */
  static async unpublishPackage(id: string) {
    const { data, error } = await (supabase as any)
      .from('packages')
      .update({ is_published: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unpublish package: ${error.message}`);
    }

    // Invalidate package cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return { data, error: null };
  }

  /**
   * Publish a package by setting is_published to true (admin/staff)
   */
  static async publishPackage(id: string) {
    const { data, error } = await (supabase as any)
      .from('packages')
      .update({ is_published: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish package: ${error.message}`);
    }

    // Invalidate package cache
    await CacheService.invalidateByTags([CacheTags.packages]);

    return { data, error: null };
  }

  /**
   * Update package rating and review count
   */
  static async updatePackageRating(packageId: string) {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('package_id', packageId);

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    if (!reviews || reviews.length === 0) {
      // No reviews, set to default values
      const { data, error } = await (supabase as any)
        .from('packages')
        .update({ avg_rating: 0, review_count: 0 })
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update package rating: ${error.message}`);
      }

      return { data, error: null };
    }

    const avgRating = (reviews as any).reduce((sum: any, review: any) => sum + review.rating, 0) / (reviews as any).length;
    const reviewCount = (reviews as any).length;

    const { data, error } = await (supabase as any)
      .from('packages')
      .update({ avg_rating: avgRating, review_count: reviewCount })
      .eq('id', packageId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package rating: ${error.message}`);
    }

    return { data, error: null };
  }
}

export type { Package, PackageInsert, PackageUpdate };
