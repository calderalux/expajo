import { supabase } from '@/lib/supabase';
import { Database, PartnerStatus } from '@/lib/supabase';

type Partner = Database['public']['Tables']['partners']['Row'];
type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

export interface PartnerFilters {
  status?: PartnerStatus;
  type?: string;
  minRating?: number;
}

export interface PartnerSortOptions {
  field: 'created_at' | 'name' | 'rating';
  order: 'asc' | 'desc';
}

export class PartnerService {
  /**
   * Get all partners with optional filtering and sorting
   */
  static async getPartners(
    filters?: PartnerFilters,
    sort?: PartnerSortOptions,
    limit?: number
  ) {
    let query = supabase
      .from('partners')
      .select('*');

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
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
      throw new Error(`Failed to fetch partners: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single partner by ID
   */
  static async getPartnerById(id: string) {
    const { data, error } = await supabase
      .from('partners')
      .select(`
        *,
        package_partner_services (
          id,
          package_id,
          item_type,
          role,
          is_included,
          usd_price_override,
          capacity_per_day,
          service_window,
          notes,
          packages (
            id,
            title,
            slug,
            destinations (
              id,
              name,
              country,
              region
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get approved partners only
   */
  static async getApprovedPartners(limit?: number) {
    return this.getPartners(
      { status: PartnerStatus.APPROVED },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Get partners by type
   */
  static async getPartnersByType(type: string, limit?: number) {
    return this.getPartners(
      { type, status: PartnerStatus.APPROVED },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Get top-rated partners
   */
  static async getTopRatedPartners(limit: number = 10) {
    return this.getPartners(
      { status: PartnerStatus.APPROVED, minRating: 4.0 },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Search partners by name or type
   */
  static async searchPartners(searchTerm: string, limit?: number) {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('status', PartnerStatus.APPROVED)
      .or(`name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
      .order('rating', { ascending: false })
      .limit(limit || 20);

    if (error) {
      throw new Error(`Failed to search partners: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get partner types
   */
  static async getPartnerTypes() {
    const { data, error } = await supabase
      .from('partners')
      .select('type')
      .eq('status', PartnerStatus.APPROVED)
      .not('type', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch partner types: ${error.message}`);
    }

    // Get unique types
    const types = Array.from(new Set(data.map(item => item.type)));
    return { data: types, error: null };
  }

  /**
   * Create a new partner
   */
  static async createPartner(partner: PartnerInsert) {
    const { data, error } = await supabase
      .from('partners')
      .insert(partner)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update a partner
   */
  static async updatePartner(id: string, updates: PartnerUpdate) {
    const { data, error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Approve a partner
   */
  static async approvePartner(id: string) {
    const { data, error } = await supabase
      .from('partners')
      .update({ status: PartnerStatus.APPROVED })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Suspend a partner
   */
  static async suspendPartner(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('partners')
      .update({ status: PartnerStatus.SUSPENDED })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to suspend partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Reject a partner
   */
  static async rejectPartner(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('partners')
      .update({ status: PartnerStatus.REJECTED })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject partner: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update partner rating
   */
  static async updatePartnerRating(partnerId: string) {
    // Get all reviews for packages where this partner is the lead partner
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        rating,
        packages!inner (
          lead_partner_id
        )
      `)
      .eq('packages.lead_partner_id', partnerId);

    if (reviewsError) {
      throw new Error(`Failed to fetch partner reviews: ${reviewsError.message}`);
    }

    if (!reviews || reviews.length === 0) {
      // No reviews, set to default rating
      const { data, error } = await supabase
        .from('partners')
        .update({ rating: 0 })
        .eq('id', partnerId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update partner rating: ${error.message}`);
      }

      return { data, error: null };
    }

    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    const { data, error } = await supabase
      .from('partners')
      .update({ rating: avgRating })
      .eq('id', partnerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update partner rating: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get partner statistics
   */
  static async getPartnerStatistics() {
    const { data, error } = await supabase
      .from('partners')
      .select('status, rating, created_at');

    if (error) {
      throw new Error(`Failed to fetch partner statistics: ${error.message}`);
    }

    const stats = {
      total_partners: data?.length || 0,
      approved_partners: data?.filter(p => p.status === PartnerStatus.APPROVED).length || 0,
      pending_partners: data?.filter(p => p.status === PartnerStatus.PENDING).length || 0,
      suspended_partners: data?.filter(p => p.status === PartnerStatus.SUSPENDED).length || 0,
      rejected_partners: data?.filter(p => p.status === PartnerStatus.REJECTED).length || 0,
      average_rating: data?.reduce((sum, p) => sum + (p.rating || 0), 0) / (data?.length || 1) || 0,
      top_rated_count: data?.filter(p => (p.rating || 0) >= 4.5).length || 0
    };

    return { data: stats, error: null };
  }

  /**
   * Get partner services for a specific package
   */
  static async getPartnerServicesForPackage(packageId: string) {
    const { data, error } = await supabase
      .from('package_partner_services')
      .select(`
        *,
        partners (
          id,
          name,
          type,
          logo_url,
          rating,
          contact_email,
          contact_phone
        ),
        package_item_options (
          id,
          name,
          description,
          price
        )
      `)
      .eq('package_id', packageId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch partner services: ${error.message}`);
    }

    return { data, error: null };
  }
}

export type { Partner, PartnerInsert, PartnerUpdate };
