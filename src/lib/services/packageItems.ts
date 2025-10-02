import { supabase } from '@/lib/supabase';
import { Database, ItemType } from '@/lib/supabase';

type PackageItem = Database['public']['Tables']['package_items']['Row'];
type PackageItemInsert = Database['public']['Tables']['package_items']['Insert'];
type PackageItemUpdate = Database['public']['Tables']['package_items']['Update'];

type PackageItemOption = Database['public']['Tables']['package_item_options']['Row'];
type PackageItemOptionInsert = Database['public']['Tables']['package_item_options']['Insert'];
type PackageItemOptionUpdate = Database['public']['Tables']['package_item_options']['Update'];

export interface PackageItemFilters {
  item_type?: ItemType;
  code?: string;
}

export interface PackageItemOptionFilters {
  package_item_id?: string;
  is_active?: boolean;
}

export class PackageItemService {
  /**
   * Get all package items with optional filtering
   */
  static async getPackageItems(filters?: PackageItemFilters) {
    let query = supabase
      .from('package_items')
      .select('*');

    // Apply filters
    if (filters) {
      if (filters.item_type) {
        query = query.eq('item_type', filters.item_type);
      }
      if (filters.code) {
        query = query.eq('code', filters.code);
      }
    }

    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch package items: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single package item by ID
   */
  static async getPackageItemById(id: string) {
    const { data, error } = await supabase
      .from('package_items')
      .select(`
        *,
        package_item_options (
          id,
          name,
          description,
          price,
          meta,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch package item: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get package items by type
   */
  static async getPackageItemsByType(itemType: ItemType) {
    return this.getPackageItems({ item_type: itemType });
  }

  /**
   * Create a new package item
   */
  static async createPackageItem(item: PackageItemInsert) {
    const { data, error } = await supabase
      .from('package_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create package item: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update a package item
   */
  static async updatePackageItem(id: string, updates: PackageItemUpdate) {
    const { data, error } = await supabase
      .from('package_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update package item: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Delete a package item
   */
  static async deletePackageItem(id: string) {
    const { error } = await supabase
      .from('package_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete package item: ${error.message}`);
    }

    return { error: null };
  }
}

export class PackageItemOptionService {
  /**
   * Get all package item options with optional filtering
   */
  static async getPackageItemOptions(filters?: PackageItemOptionFilters) {
    let query = supabase
      .from('package_item_options')
      .select(`
        *,
        package_items (
          id,
          name,
          item_type
        )
      `);

    // Apply filters
    if (filters) {
      if (filters.package_item_id) {
        query = query.eq('package_item_id', filters.package_item_id);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
    }

    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch package item options: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single package item option by ID
   */
  static async getPackageItemOptionById(id: string) {
    const { data, error } = await supabase
      .from('package_item_options')
      .select(`
        *,
        package_items (
          id,
          name,
          item_type
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch package item option: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get options for a specific package item
   */
  static async getOptionsForPackageItem(packageItemId: string) {
    return this.getPackageItemOptions({ 
      package_item_id: packageItemId, 
      is_active: true 
    });
  }

  /**
   * Get active options only
   */
  static async getActiveOptions() {
    return this.getPackageItemOptions({ is_active: true });
  }

  /**
   * Create a new package item option
   */
  static async createPackageItemOption(option: PackageItemOptionInsert) {
    const { data, error } = await supabase
      .from('package_item_options')
      .insert(option)
      .select(`
        *,
        package_items (
          id,
          name,
          item_type
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create package item option: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update a package item option
   */
  static async updatePackageItemOption(id: string, updates: PackageItemOptionUpdate) {
    const { data, error } = await supabase
      .from('package_item_options')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        package_items (
          id,
          name,
          item_type
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update package item option: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Delete a package item option
   */
  static async deletePackageItemOption(id: string) {
    const { error } = await supabase
      .from('package_item_options')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete package item option: ${error.message}`);
    }

    return { error: null };
  }

  /**
   * Activate/deactivate a package item option
   */
  static async toggleOptionStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('package_item_options')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle option status: ${error.message}`);
    }

    return { data, error: null };
  }
}

export class PackageOptionMappingService {
  /**
   * Get option mappings for a package
   */
  static async getPackageOptionMappings(packageId: string) {
    const { data, error } = await supabase
      .from('package_option_mappings')
      .select(`
        *,
        package_item_options (
          id,
          name,
          description,
          price,
          meta,
          is_active,
          package_items (
            id,
            name,
            item_type
          )
        )
      `)
      .eq('package_id', packageId);

    if (error) {
      throw new Error(`Failed to fetch package option mappings: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Add an option to a package
   */
  static async addOptionToPackage(packageId: string, optionId: string) {
    const { data, error } = await supabase
      .from('package_option_mappings')
      .insert({
        package_id: packageId,
        option_id: optionId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add option to package: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Remove an option from a package
   */
  static async removeOptionFromPackage(packageId: string, optionId: string) {
    const { error } = await supabase
      .from('package_option_mappings')
      .delete()
      .eq('package_id', packageId)
      .eq('option_id', optionId);

    if (error) {
      throw new Error(`Failed to remove option from package: ${error.message}`);
    }

    return { error: null };
  }

  /**
   * Bulk add options to a package
   */
  static async addOptionsToPackage(packageId: string, optionIds: string[]) {
    const mappings = optionIds.map(optionId => ({
      package_id: packageId,
      option_id: optionId
    }));

    const { data, error } = await supabase
      .from('package_option_mappings')
      .insert(mappings)
      .select();

    if (error) {
      throw new Error(`Failed to add options to package: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Bulk remove options from a package
   */
  static async removeOptionsFromPackage(packageId: string, optionIds: string[]) {
    const { error } = await supabase
      .from('package_option_mappings')
      .delete()
      .eq('package_id', packageId)
      .in('option_id', optionIds);

    if (error) {
      throw new Error(`Failed to remove options from package: ${error.message}`);
    }

    return { error: null };
  }
}

export type { 
  PackageItem, 
  PackageItemInsert, 
  PackageItemUpdate,
  PackageItemOption,
  PackageItemOptionInsert,
  PackageItemOptionUpdate
};
