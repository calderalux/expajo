import { supabase } from '../supabase';
import { Database } from '../supabase';

type FAQ = Database['public']['Tables']['faqs']['Row'];
type FAQInsert = Database['public']['Tables']['faqs']['Insert'];
type FAQUpdate = Database['public']['Tables']['faqs']['Update'];

export interface FAQFilters {
  category?: string;
  is_active?: boolean;
}

export class FAQService {
  /**
   * Get all FAQs with optional filtering
   */
  static async getFAQs(filters: FAQFilters = {}): Promise<{ data: FAQ[] | null; error: any }> {
    try {
      let query = supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single FAQ by ID
   */
  static async getFAQById(id: string): Promise<{ data: FAQ | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching FAQ by ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new FAQ (admin only)
   */
  static async createFAQ(faq: FAQInsert): Promise<{ data: FAQ | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating FAQ:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing FAQ (admin only)
   */
  static async updateFAQ(id: string, updates: FAQUpdate): Promise<{ data: FAQ | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating FAQ:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an FAQ (admin only)
   */
  static async deleteFAQ(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      return { error };
    }
  }

  /**
   * Get FAQs by category
   */
  static async getFAQsByCategory(category: string): Promise<{ data: FAQ[] | null; error: any }> {
    return this.getFAQs({ category, is_active: true });
  }

  /**
   * Get active FAQs only
   */
  static async getActiveFAQs(): Promise<{ data: FAQ[] | null; error: any }> {
    return this.getFAQs({ is_active: true });
  }

  /**
   * Reorder FAQs (admin only)
   */
  static async reorderFAQs(faqIds: string[]): Promise<{ error: any }> {
    try {
      const updates = faqIds.map((id, index) => ({
        id,
        order_index: index + 1,
      }));

      const { error } = await supabase
        .from('faqs')
        .upsert(updates);

      return { error };
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      return { error };
    }
  }
}
