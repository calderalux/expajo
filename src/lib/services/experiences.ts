import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Experience = Database['public']['Tables']['experiences']['Row'];
type ExperienceInsert = Database['public']['Tables']['experiences']['Insert'];
type ExperienceUpdate = Database['public']['Tables']['experiences']['Update'];

export interface ExperienceFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ExperienceSortOptions {
  field: 'created_at' | 'rating' | 'price_per_person' | 'title';
  order: 'asc' | 'desc';
}

export class ExperienceService {
  /**
   * Get all experiences with optional filtering and sorting
   */
  static async getExperiences(
    filters?: ExperienceFilters,
    sort?: ExperienceSortOptions,
    limit?: number
  ) {
    let query = supabase
      .from('experiences')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (filters) {
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
      throw new Error(`Failed to fetch experiences: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single experience by ID
   */
  static async getExperienceById(id: string) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch experience: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get featured experiences
   */
  static async getFeaturedExperiences(limit: number = 6) {
    return this.getExperiences(
      { isFeatured: true },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Get experiences by category
   */
  static async getExperiencesByCategory(category: string, limit?: number) {
    return this.getExperiences(
      { category },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Search experiences by title or description
   */
  static async searchExperiences(searchTerm: string, limit?: number) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('rating', { ascending: false })
      .limit(limit || 20);

    if (error) {
      throw new Error(`Failed to search experiences: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get experience categories
   */
  static async getExperienceCategories() {
    const { data, error } = await supabase
      .from('experiences')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return { data: categories, error: null };
  }

  /**
   * Create a new experience
   */
  static async createExperience(experience: ExperienceInsert) {
    const { data, error } = await supabase
      .from('experiences')
      .insert(experience)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create experience: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update an experience
   */
  static async updateExperience(id: string, updates: ExperienceUpdate) {
    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update experience: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Delete an experience (soft delete by setting is_active to false)
   */
  static async deleteExperience(id: string) {
    const { data, error } = await supabase
      .from('experiences')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete experience: ${error.message}`);
    }

    return { data, error: null };
  }
}

export type { Experience, ExperienceInsert, ExperienceUpdate };