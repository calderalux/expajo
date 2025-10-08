import { createServerClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { CacheService, CacheKeys, CacheTags } from '@/lib/services/cache';

export type PackageOptionMapping = Database['public']['Tables']['package_option_mappings']['Row'];
export type PackageOptionMappingInsert = Database['public']['Tables']['package_option_mappings']['Insert'];
export type PackageOptionMappingUpdate = Database['public']['Tables']['package_option_mappings']['Update'];

export interface PackageOptionMappingWithDetails extends PackageOptionMapping {
  package_item_option: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    package_item_id: string;
    is_active: boolean | null;
  };
}

export class PackageOptionMappingService {
  private static client = createServerClient();

  // Get option mappings for a package
  static async getPackageOptionMappings(packageId: string): Promise<PackageOptionMappingWithDetails[]> {
    const cacheKey = CacheKeys.packageOptionMappings.byPackageId(packageId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_option_mappings')
          .select(`
            *,
            package_item_option:package_item_options(
              id,
              name,
              description,
              price,
              package_item_id,
              is_active
            )
          `)
          .eq('package_id', packageId);

        if (error) {
          throw new Error(`Failed to fetch package option mappings: ${error.message}`);
        }

        return (data || []).map(item => ({
          ...(item as any),
          package_item_option: (item as any).package_item_option as any
        }));
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageOptionMappings, CacheTags.packages],
      }
    );
  }

  // Add option to package
  static async addOptionToPackage(
    packageId: string,
    optionId: string
  ): Promise<PackageOptionMapping> {
    const { data, error } = await this.client
      .from('package_option_mappings')
      .insert({
        package_id: packageId,
        option_id: optionId,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add option to package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageOptionMappings, CacheTags.packages]);

    return data;
  }

  // Remove option from package
  static async removeOptionFromPackage(
    packageId: string,
    optionId: string
  ): Promise<void> {
    const { error } = await this.client
      .from('package_option_mappings')
      .delete()
      .eq('package_id', packageId)
      .eq('option_id', optionId);

    if (error) {
      throw new Error(`Failed to remove option from package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageOptionMappings, CacheTags.packages]);
  }

  // Get packages for an option
  static async getOptionPackages(optionId: string): Promise<PackageOptionMapping[]> {
    const cacheKey = CacheKeys.packageOptionMappings.byOptionId(optionId);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await this.client
          .from('package_option_mappings')
          .select('*')
          .eq('option_id', optionId);

        if (error) {
          throw new Error(`Failed to fetch option packages: ${error.message}`);
        }

        return data || [];
      },
      {
        ttl: 300, // 5 minutes
        tags: [CacheTags.packageOptionMappings],
      }
    );
  }

  // Bulk add options to package
  static async addOptionsToPackage(
    packageId: string,
    optionIds: string[]
  ): Promise<PackageOptionMapping[]> {
    const mappings = optionIds.map(optionId => ({
      package_id: packageId,
      option_id: optionId,
    }));

    const { data, error } = await this.client
      .from('package_option_mappings')
      .insert(mappings as any)  
      .select();

    if (error) {
      throw new Error(`Failed to add options to package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageOptionMappings, CacheTags.packages]);

    return data || [];
  }

  // Bulk remove options from package
  static async removeOptionsFromPackage(
    packageId: string,
    optionIds: string[]
  ): Promise<void> {
    const { error } = await this.client
      .from('package_option_mappings')
      .delete()
      .eq('package_id', packageId)
      .in('option_id', optionIds);

    if (error) {
      throw new Error(`Failed to remove options from package: ${error.message}`);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageOptionMappings, CacheTags.packages]);
  }

  // Sync package options (replace all options with new set)
  static async syncPackageOptions(
    packageId: string,
    optionIds: string[]
  ): Promise<void> {
    // First, remove all existing mappings
    await this.client
      .from('package_option_mappings')
      .delete()
      .eq('package_id', packageId);

    // Then add new mappings
    if (optionIds.length > 0) {
      await this.addOptionsToPackage(packageId, optionIds);
    }

    // Invalidate caches
    await CacheService.invalidateByTags([CacheTags.packageOptionMappings, CacheTags.packages]);
  }
}
