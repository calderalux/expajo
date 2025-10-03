import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { MembershipTier } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type AppRole = Database['public']['Tables']['app_roles']['Row'];
type AppRoleInsert = Database['public']['Tables']['app_roles']['Insert'];

export interface ProfileFilters {
  membership?: MembershipTier;
  mfa_enabled?: boolean;
}

export class ProfileService {
  /**
   * Get all profiles with optional filtering
   */
  static async getProfiles(filters?: ProfileFilters, limit?: number) {
    let query = supabase
      .from('profiles')
      .select('*');

    // Apply filters
    if (filters) {
      if (filters.membership) {
        query = query.eq('membership', filters.membership);
      }
      if (filters.mfa_enabled !== undefined) {
        query = query.eq('mfa_enabled', filters.mfa_enabled);
      }
    }

    query = query.order('created_at', { ascending: false });

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single profile by ID
   */
  static async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        app_roles (
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get profile by email
   */
  static async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile by email: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Create a new profile
   */
  static async createProfile(profile: ProfileInsert) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update a profile
   */
  static async updateProfile(id: string, updates: ProfileUpdate) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update user membership tier
   */
  static async updateMembership(id: string, membership: MembershipTier) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ membership })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update membership: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Enable/disable MFA for a user
   */
  static async toggleMFA(id: string, enabled: boolean) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ mfa_enabled: enabled })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle MFA: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics() {
    const { data, error } = await supabase
      .from('profiles')
      .select('membership, mfa_enabled, created_at');

    if (error) {
      throw new Error(`Failed to fetch user statistics: ${error.message}`);
    }

    const stats = {
      total_users: (data as any)?.length || 0,
      basic_members: (data as any)?.filter((p: any) => p.membership === MembershipTier.BASIC).length || 0,
      premium_members: (data as any)?.filter((p: any) => p.membership === MembershipTier.PREMIUM).length || 0,
      vip_members: (data as any)?.filter((p: any) => p.membership === MembershipTier.VIP).length || 0,
      mfa_enabled_users: (data as any)?.filter((p: any) => p.mfa_enabled).length || 0,
      recent_signups: (data as any)?.filter((p: any) => {
        const createdAt = new Date(p.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length || 0
    };

    return { data: stats, error: null };
  }

  /**
   * Get user's booking history
   */
  static async getUserBookingHistory(userId: string, limit?: number) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          title,
          slug,
          destinations (
            id,
            name,
            country
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 10);

    if (error) {
      throw new Error(`Failed to fetch user booking history: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get user's review history
   */
  static async getUserReviewHistory(userId: string, limit?: number) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        packages (
          id,
          title,
          slug,
          destinations (
            id,
            name,
            country
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 10);

    if (error) {
      throw new Error(`Failed to fetch user review history: ${error.message}`);
    }

    return { data, error: null };
  }
}

export class AppRoleService {
  /**
   * Get all app roles
   */
  static async getAppRoles() {
    const { data, error } = await supabase
      .from('app_roles')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email
        )
      `);

    if (error) {
      throw new Error(`Failed to fetch app roles: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get user's role
   */
  static async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('app_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user role: ${error.message}`);
    }

    return { data: (data as any)?.role || null, error: null };
  }

  /**
   * Check if user is admin
   */
  static async isUserAdmin(userId: string) {
    const { data: role, error } = await this.getUserRole(userId);
    
    if (error) {
      throw new Error(`Failed to check admin status: ${error}`);
    }

    return { data: role === 'admin', error: null };
  }

  /**
   * Assign admin role to user
   */
  static async assignAdminRole(userId: string) {
    // Check if user already has a role
    const { data: existingRole, error: checkError } = await supabase
      .from('app_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing role: ${checkError.message}`);
    }

    if (existingRole) {
      // Update existing role
      const { data, error } = await (supabase as any)
        .from('app_roles')
        .update({ role: 'admin' })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      return { data, error: null };
    } else {
      // Create new role
      const roleInsert: AppRoleInsert = {
        user_id: userId,
        role: 'admin'
      };

      const { data, error } = await (supabase as any)
        .from('app_roles')
        .insert(roleInsert)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to assign admin role: ${error.message}`);
      }

      return { data, error: null };
    }
  }

  /**
   * Remove admin role from user
   */
  static async removeAdminRole(userId: string) {
    const { error } = await supabase
      .from('app_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove admin role: ${error.message}`);
    }

    return { error: null };
  }

  /**
   * Get all admin users
   */
  static async getAdminUsers() {
    const { data, error } = await supabase
      .from('app_roles')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          avatar_url,
          created_at
        )
      `)
      .eq('role', 'admin');

    if (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }

    return { data, error: null };
  }
}

export type { Profile, ProfileInsert, ProfileUpdate, AppRole, AppRoleInsert };
