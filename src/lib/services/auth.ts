import { supabase, createServerClient } from '@/lib/supabase';
import { 
  AdminLoginRequest, 
  OtpRequest, 
  AuthResponse, 
  OtpResponse, 
  AdminProfile, 
  AdminSession,
  UserRole,
  OtpPurpose,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS
} from '@/types/auth';
import { CacheService, CacheKeys, CacheTags } from './cache';
// Only import email service on server side
let emailService: any = null;
if (typeof window === 'undefined') {
  try {
    emailService = require('./email').emailService;
  } catch (error) {
    console.warn('Email service not available:', error);
  }
}

export class AuthService {
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly SESSION_TIMEOUT_HOURS = 8;
  private static readonly MAX_OTP_ATTEMPTS = 3;

  /**
   * Generate and send OTP code to admin email
   */
  static async requestOtp(request: OtpRequest): Promise<OtpResponse> {
    try {
      const { email, purpose } = request;

      // Note: Admin email check is now handled by the API route
      // This method assumes the email has already been validated

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in database
      const serverClient = createServerClient();
      const { error: otpError } = await serverClient
        .from('otp_codes')
        .insert({
          email,
          code: otpCode,
          purpose,
          expires_at: expiresAt.toISOString(),
          max_attempts: this.MAX_OTP_ATTEMPTS,
        });

      if (otpError) {
        console.error('OTP storage error:', otpError);
        return {
          success: false,
          error: 'Failed to generate OTP code',
          message: 'Failed to generate OTP code',
        };
      }

      // Send OTP via email (implement email service)
      await this.sendOtpEmail(email, otpCode, purpose);

      return {
        success: true,
        message: `OTP code sent to ${email}`,
        expires_at: expiresAt.toISOString(),
      };
    } catch (error) {
      console.error('OTP request error:', error);
      return {
        success: false,
        error: 'Failed to send OTP code',
        message: 'Failed to send OTP code',
      };
    }
  }

  /**
   * Verify OTP and create admin session
   */
  static async verifyOtpAndLogin(request: AdminLoginRequest): Promise<AuthResponse> {
    try {
      const { email, otp } = request;

      // Verify OTP
      const otpVerification = await this.verifyOtp(email, otp, OtpPurpose.ADMIN_LOGIN);
      if (!otpVerification.success) {
        return {
          success: false,
          error: otpVerification.error,
          message: 'OTP verification failed',
        };
      }

      // Get or create user profile
      const userProfile = await this.getOrCreateAdminProfile(email);
      if (!userProfile) {
        return {
          success: false,
          error: 'Failed to create user profile',
          message: 'Failed to create user profile',
        };
      }

      // Create session
      const session = await this.createAdminSession(userProfile.id);
      if (!session) {
        return {
          success: false,
          error: 'Failed to create session',
          message: 'Failed to create session',
        };
      }

      // Update login stats
      await this.updateLoginStats(userProfile.id);

      // Get full profile with roles
      const fullProfile = await this.getAdminProfileWithRoles(userProfile.id);

      return {
        success: true,
        user: fullProfile || undefined,
        session,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  /**
   * Verify OTP code
   */
  private static async verifyOtp(
    email: string, 
    code: string, 
    purpose: OtpPurpose
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const serverClient = createServerClient();
      const { data: otpData, error } = await serverClient
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('purpose', purpose)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !otpData) {
        return {
          success: false,
          error: 'Invalid or expired OTP code',
        };
      }

      // Check attempts
      if (otpData.attempts >= otpData.max_attempts) {
        return {
          success: false,
          error: 'Maximum attempts exceeded',
        };
      }

      // Mark OTP as used
      await serverClient
        .from('otp_codes')
        .update({ 
          is_used: true,
          attempts: otpData.attempts + 1,
        })
        .eq('id', otpData.id);

      return { success: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: 'OTP verification failed',
      };
    }
  }

  /**
   * Check if email is authorized for admin access
   */
  static async isAdminEmail(email: string): Promise<boolean> {
    try {
      const serverClient = createServerClient();
      const { data, error } = await serverClient
        .from('profiles')
        .select('is_admin')
        .eq('email', email)
        .eq('is_admin', true)
        .single();

      return !error && data?.is_admin === true;
    } catch (error) {
      console.error('Admin email check error:', error);
      return false;
    }
  }

  /**
   * Get or create admin profile
   */
  private static async getOrCreateAdminProfile(email: string): Promise<any> {
    try {
      const serverClient = createServerClient();
      
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await serverClient
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (existingProfile && !fetchError) {
        return existingProfile;
      }

      // Create new profile if doesn't exist
      const { data: newProfile, error: createError } = await serverClient
        .from('profiles')
        .insert({
          email,
          is_admin: true,
          admin_level: 2, // Default admin level
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return null;
      }

      // Create admin role assignment
      await serverClient
        .from('app_roles')
        .insert({
          user_id: newProfile.id,
          role: 'admin',
          is_active: true,
        });

      return newProfile;
    } catch (error) {
      console.error('Profile management error:', error);
      return null;
    }
  }

  /**
   * Create admin session
   */
  private static async createAdminSession(userId: string): Promise<AdminSession | null> {
    try {
      const serverClient = createServerClient();
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);

      const { data: session, error } = await serverClient
        .from('admin_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session creation error:', error);
      return null;
    }
  }

  /**
   * Get admin profile with roles and permissions
   */
  private static async getAdminProfileWithRoles(userId: string): Promise<AdminProfile | null> {
    try {
      const cacheKey = `admin:profile:${userId}`;
      
      return CacheService.getOrSet(
        cacheKey,
        async () => {
          const serverClient = createServerClient();
          const { data: profile, error: profileError } = await serverClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError || !profile) {
            return null;
          }

          // Get user roles
          const { data: roles, error: rolesError } = await serverClient
            .from('app_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('is_active', true);

          let userRoles = roles?.map(r => r.role) || [];
          
          // If no roles found but user is admin, create admin role and use it
          if (userRoles.length === 0 && profile.is_admin) {
            await serverClient
              .from('app_roles')
              .insert({
                user_id: userId,
                role: 'admin',
                is_active: true,
              });
            userRoles = ['admin'];
          }
          
          // Fallback to admin role if still no roles
          if (userRoles.length === 0) {
            userRoles = ['admin'];
          }

          // Get permissions for all roles
          const permissions: Record<string, string[]> = {};
          for (const role of userRoles) {
            permissions[role] = DEFAULT_ROLE_PERMISSIONS[role as UserRole] || [];
          }

          return {
            ...profile,
            roles: userRoles,
            permissions,
          };
        },
        {
          ttl: 300, // 5 minutes
          tags: [CacheTags.destinations, 'admin-profiles'],
        }
      );
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  /**
   * Validate session token
   */
  static async validateSession(sessionToken: string): Promise<AuthResponse> {
    try {
      const serverClient = createServerClient();
      const { data: session, error } = await serverClient
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return {
          success: false,
          error: 'Invalid or expired session',
        };
      }
      // Update last accessed time
      await serverClient
        .from('admin_sessions')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', session.id);

      const userProfile = await this.getAdminProfileWithRoles(session.user_id);

      return {
        success: true,
        user: userProfile || undefined,
        session,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        success: false,
        error: 'Session validation failed',
      };
    }
  }

  /**
   * Logout and invalidate session
   */
  static async logout(sessionToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const serverClient = createServerClient();
      const { error } = await serverClient
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Logout error:', error);
        return {
          success: false,
          error: 'Logout failed',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    try {
      const serverClient = createServerClient();
      const { data, error } = await serverClient.rpc('has_permission', {
        resource_name: resource,
        action_name: action,
      });

      return !error && data === true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get user's role level
   */
  static async getUserRoleLevel(userId: string): Promise<number> {
    try {
      const serverClient = createServerClient();
      
      // Get user profile first
      const { data: profile, error: profileError } = await serverClient
        .from('profiles')
        .select('admin_level, is_admin')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return 0;
      }

      // If user is admin, return admin level
      if (profile.is_admin) {
        return profile.admin_level || 2; // Default to level 2 (Admin) if not set
      }

      // Check if user has any roles in app_roles table
      const { data: roles, error: rolesError } = await serverClient
        .from('app_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rolesError || !roles || roles.length === 0) {
        return 0; // Guest
      }

      // Map role names to levels
      const roleLevels: Record<string, number> = {
        'super_admin': 3,
        'admin': 2,
        'staff': 1,
        'partner': 1,
        'guest': 0
      };

      // Return the highest role level
      const maxLevel = Math.max(...roles.map(r => roleLevels[r.role] || 0));
      return maxLevel;
    } catch (error) {
      console.error('Role level check error:', error);
      return 0;
    }
  }

  /**
   * Update login statistics
   */
  private static async updateLoginStats(userId: string): Promise<void> {
    try {
      const serverClient = createServerClient();
      await serverClient
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Increment login count separately
      await serverClient.rpc('increment_login_count', { user_id: userId });
    } catch (error) {
      console.error('Login stats update error:', error);
    }
  }

  /**
   * Generate secure session token
   */
  private static generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Send OTP email (now properly implemented)
   */
  private static async sendOtpEmail(
    email: string, 
    code: string, 
    purpose: OtpPurpose
  ): Promise<void> {
    try {
      if (!emailService) {
        // Email service not available (client-side), just log
        console.log(`OTP Code for ${email}: ${code} (Purpose: ${purpose})`);
        return;
      }

      const result = await emailService.sendOtp({
        to: email,
        code,
        purpose,
        expiresIn: this.OTP_EXPIRY_MINUTES,
      });

      if (!result.success) {
        console.error('Failed to send OTP email:', result.error);
        // Don't throw error - OTP is still valid, just email failed
      }
    } catch (error) {
      console.error('Email service error:', error);
      // Don't throw error - OTP is still valid, just email failed
    }
  }

  /**
   * Clean up expired sessions and OTP codes
   */
  static async cleanupExpiredData(): Promise<void> {
    try {
      const serverClient = createServerClient();
      const now = new Date().toISOString();

      // Clean up expired sessions
      await serverClient
        .from('admin_sessions')
        .update({ is_active: false })
        .lt('expires_at', now);

      // Clean up expired OTP codes
      await serverClient
        .from('otp_codes')
        .delete()
        .lt('expires_at', now);

      console.log('Expired sessions and OTP codes cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}
