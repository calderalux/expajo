import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Destination = Database['public']['Tables']['destinations']['Row'];
type DestinationInsert = Database['public']['Tables']['destinations']['Insert'];
type DestinationUpdate = Database['public']['Tables']['destinations']['Update'];

export interface DestinationFilters {
  country?: string;
  location?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface DestinationSortOptions {
  field: 'created_at' | 'title' | 'location';
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
    let query = supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (filters) {
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
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
  }

  /**
   * Get a single destination by ID
   */
  static async getDestinationById(id: string) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch destination: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get featured destinations
   */
  static async getFeaturedDestinations(limit: number = 6) {
    return this.getDestinations(
      { isFeatured: true },
      { field: 'title', order: 'asc' },
      limit
    );
  }

  /**
   * Get destinations by country
   */
  static async getDestinationsByCountry(country: string, limit?: number) {
    return this.getDestinations(
      { country },
      { field: 'title', order: 'asc' },
      limit
    );
  }

  /**
   * Search destinations by title, description, or location
   */
  static async searchDestinations(searchTerm: string, limit?: number) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('title', { ascending: true })
      .limit(limit || 20);

    if (error) {
      throw new Error(`Failed to search destinations: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get destination countries
   */
  static async getDestinationCountries() {
    const { data, error } = await supabase
      .from('destinations')
      .select('country')
      .eq('is_active', true)
      .not('country', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }

    // Get unique countries
    const countries = Array.from(new Set(data.map(item => item.country)));
    return { data: countries, error: null };
  }

  /**
   * Create a new destination
   */
  static async createDestination(destination: DestinationInsert) {
    const { data, error } = await supabase
      .from('destinations')
      .insert(destination)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create destination: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update a destination
   */
  static async updateDestination(id: string, updates: DestinationUpdate) {
    const { data, error } = await supabase
      .from('destinations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update destination: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Delete a destination (soft delete by setting is_active to false)
   */
  static async deleteDestination(id: string) {
    const { data, error } = await supabase
      .from('destinations')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete destination: ${error.message}`);
    }

    return { data, error: null };
  }
}

export type { Destination, DestinationInsert, DestinationUpdate };
