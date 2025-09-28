import { supabase } from '../supabase';
import { Database } from '../supabase';

type Experience = Database['public']['Tables']['experiences']['Row'];

export interface ExperienceFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isFeatured?: boolean;
}

export interface ExperienceSortOptions {
  field: 'price_per_person' | 'rating' | 'created_at' | 'reviews_count';
  order: 'asc' | 'desc';
}

export class ExperienceService {
  /**
   * Fetch all experiences with optional filters and sorting
   */
  static async getExperiences(
    filters: ExperienceFilters = {},
    sortOptions: ExperienceSortOptions = { field: 'created_at', order: 'desc' },
    limit = 20,
    offset = 0
  ): Promise<{ data: Experience[]; error: any }> {
    try {
      let query = supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price_per_person', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price_per_person', filters.maxPrice);
      }

      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      // Apply sorting
      query = query.order(sortOptions.field, { ascending: sortOptions.order === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Fetch a single experience by ID
   */
  static async getExperienceById(id: string): Promise<{ data: Experience | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Fetch featured experiences
   */
  static async getFeaturedExperiences(limit = 6): Promise<{ data: Experience[]; error: any }> {
    return this.getExperiences({ isFeatured: true }, { field: 'rating', order: 'desc' }, limit);
  }

  /**
   * Search experiences by title or description
   */
  static async searchExperiences(
    searchTerm: string,
    filters: ExperienceFilters = {},
    limit = 20
  ): Promise<{ data: Experience[]; error: any }> {
    try {
      let query = supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      // Apply additional filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price_per_person', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price_per_person', filters.maxPrice);
      }

      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      query = query.order('rating', { ascending: false });
      query = query.limit(limit);

      const { data, error } = await query;

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get unique categories
   */
  static async getCategories(): Promise<{ data: string[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) return { data: [], error };

      const categories = [...new Set(data.map(item => item.category))];
      return { data: categories, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get unique locations
   */
  static async getLocations(): Promise<{ data: string[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('location')
        .eq('is_active', true)
        .not('location', 'is', null);

      if (error) return { data: [], error };

      const locations = [...new Set(data.map(item => item.location))];
      return { data: locations, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}
