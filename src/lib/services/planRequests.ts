import { supabase } from '../supabase';
import { Database } from '../supabase';

type PlanRequest = Database['public']['Tables']['plan_requests']['Row'];
type PlanRequestInsert = Database['public']['Tables']['plan_requests']['Insert'];

export interface PlanRequestFormData {
  location: string;
  travel_date: string;
  guests: number;
  special_requests?: string;
  budget_range?: string;
  interests?: string[];
  contact_email?: string;
  contact_phone?: string;
}

export class PlanRequestService {
  /**
   * Create a new plan request
   */
  static async createPlanRequest(
    data: PlanRequestFormData
  ): Promise<{ data: PlanRequest | null; error: any }> {
    try {
      const insertData: PlanRequestInsert = {
        location: data.location,
        travel_date: data.travel_date,
        guests: data.guests,
        special_requests: data.special_requests || null,
        budget_range: data.budget_range || null,
        interests: data.interests || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        status: 'pending',
      };

      const { data: result, error } = await supabase
        .from('plan_requests')
        .insert(insertData)
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get plan request by ID
   */
  static async getPlanRequestById(
    id: string
  ): Promise<{ data: PlanRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get plan requests by email
   */
  static async getPlanRequestsByEmail(
    email: string
  ): Promise<{ data: PlanRequest[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('*')
        .eq('contact_email', email)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Update plan request status
   */
  static async updatePlanRequestStatus(
    id: string,
    status: string
  ): Promise<{ data: PlanRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all plan requests (admin only)
   */
  static async getAllPlanRequests(
    limit = 50,
    offset = 0
  ): Promise<{ data: PlanRequest[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get plan requests by status
   */
  static async getPlanRequestsByStatus(
    status: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: PlanRequest[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get plan request statistics
   */
  static async getPlanRequestStats(): Promise<{
    data: {
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      cancelled: number;
    };
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('status');

      if (error) return { data: { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 }, error };

      const stats = data.reduce(
        (acc, request) => {
          acc.total++;
          acc[request.status as keyof typeof acc]++;
          return acc;
        },
        { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
      );

      return { data: stats, error: null };
    } catch (error) {
      return { data: { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 }, error };
    }
  }
}
