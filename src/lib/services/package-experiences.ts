import { createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

export type PackageExperience = Database['public']['Tables']['package_experiences']['Row'];
export type PackageExperienceInsert = Database['public']['Tables']['package_experiences']['Insert'];
export type PackageExperienceUpdate = Database['public']['Tables']['package_experiences']['Update'];

export interface PackageExperienceWithDetails extends PackageExperience {
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
}

export class PackageExperienceService {
  private static client = createServerClient();

  // Get experiences for a package
  static async getPackageExperiences(packageId: string): Promise<PackageExperienceWithDetails[]> {
    const cacheKey = CacheKeys.packageExperiences.byPackageId(packageId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_experiences')
          .select(`
            *,
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
          `)
          .eq('package_id', packageId)
          .order('sort_order', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch package experiences: ${error.message}`);
        }

        return (data || []).map(item => ({
          ...item,
          experience: item.experience as any
        }));
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageExperiences, CacheTags.packages],
      }
    );
  }

  // Add experience to package
  static async addExperienceToPackage(
    packageId: string,
    experienceId: string,
    options: {
      is_optional?: boolean;
      is_included_in_price?: boolean;
      sort_order?: number;
    } = {}
  ): Promise<PackageExperience> {
    const { data, error } = await this.client
      .from('package_experiences')
      .insert({
        package_id: packageId,
        experience_id: experienceId,
        is_optional: options.is_optional ?? false,
        is_included_in_price: options.is_included_in_price ?? true,
        sort_order: options.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add experience to package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageExperiences, CacheTags.packages]);

    return data;
  }

  // Remove experience from package
  static async removeExperienceFromPackage(
    packageId: string,
    experienceId: string
  ): Promise<void> {
    const { error } = await this.client
      .from('package_experiences')
      .delete()
      .eq('package_id', packageId)
      .eq('experience_id', experienceId);

    if (error) {
      throw new Error(`Failed to remove experience from package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageExperiences, CacheTags.packages]);
  }

  // Update package experience
  static async updatePackageExperience(
    packageId: string,
    experienceId: string,
    updates: Partial<PackageExperienceUpdate>
  ): Promise<PackageExperience> {
    const { data, error } = await this.client
      .from('package_experiences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('package_id', packageId)
      .eq('experience_id', experienceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package experience: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageExperiences, CacheTags.packages]);

    return data;
  }

  // Reorder package experiences
  static async reorderPackageExperiences(
    packageId: string,
    experienceOrder: { experience_id: string; sort_order: number }[]
  ): Promise<void> {
    const updates = experienceOrder.map(item => ({
      package_id: packageId,
      experience_id: item.experience_id,
      sort_order: item.sort_order,
    }));

    // Use upsert to update sort orders
    const { error } = await this.client
      .from('package_experiences')
      .upsert(updates, {
        onConflict: 'package_id,experience_id',
      });

    if (error) {
      throw new Error(`Failed to reorder package experiences: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageExperiences, CacheTags.packages]);
  }

  // Get packages for an experience
  static async getExperiencePackages(experienceId: string): Promise<PackageExperience[]> {
    const cacheKey = CacheKeys.packageExperiences.byExperienceId(experienceId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_experiences')
          .select('*')
          .eq('experience_id', experienceId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch experience packages: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageExperiences],
      }
    );
  }
}
