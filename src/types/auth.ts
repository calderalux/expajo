import { z } from 'zod';

// =====================================================
// Authentication Types & Schemas
// =====================================================

// User Roles Enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  PARTNER = 'partner',
  GUEST = 'guest',
}

// Authentication Methods
export enum AuthMethod {
  EMAIL_OTP = 'email_otp',
  USERNAME_PASSWORD = 'username_password',
  PARTNER_OTP = 'partner_otp',
}

// OTP Purposes
export enum OtpPurpose {
  ADMIN_LOGIN = 'admin_login',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR = 'two_factor',
}

// Session Status
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

// =====================================================
// Zod Schemas for Validation
// =====================================================

// Admin Login Request
export const AdminLoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

// OTP Request
export const OtpRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.nativeEnum(OtpPurpose),
});

// Session Management
export const SessionCreateSchema = z.object({
  user_id: z.string().uuid(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  expires_at: z.date(),
});

// Role Assignment
export const RoleAssignmentSchema = z.object({
  user_id: z.string().uuid(),
  role: z.nativeEnum(UserRole),
  permissions: z.record(z.any()).optional(),
  created_by: z.string().uuid().optional(),
});

// Permission Check
export const PermissionCheckSchema = z.object({
  resource: z.string().min(1),
  action: z.string().min(1),
});

// =====================================================
// TypeScript Types
// =====================================================

export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;
export type OtpRequest = z.infer<typeof OtpRequestSchema>;
export type SessionCreate = z.infer<typeof SessionCreateSchema>;
export type RoleAssignment = z.infer<typeof RoleAssignmentSchema>;
export type PermissionCheck = z.infer<typeof PermissionCheckSchema>;

// User Profile with Role Information
export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  permissions: Record<string, string[]>;
  is_admin: boolean;
  admin_level: number;
  last_login_at: string | null;
  login_count: number;
  two_factor_enabled: boolean;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

// Session Information
export interface AdminSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  last_accessed_at: string;
}

// OTP Code Information
export interface OtpCode {
  id: string;
  email: string;
  code: string;
  purpose: OtpPurpose;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  is_used: boolean;
  created_at: string;
}

// Role Permission Information
export interface RolePermission {
  id: string;
  role: UserRole;
  resource: string;
  action: string;
  conditions: Record<string, any>;
  created_at: string;
}

// Audit Log Entry
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Admin Settings
export interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  is_public: boolean;
  updated_by: string | null;
  updated_at: string;
}

// =====================================================
// Authentication Response Types
// =====================================================

export interface AuthResponse {
  success: boolean;
  user?: AdminProfile;
  session?: AdminSession;
  message?: string;
  error?: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expires_at?: string;
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  session?: AdminSession;
  user?: AdminProfile;
  message?: string;
  error?: string;
}

// =====================================================
// Permission Constants
// =====================================================

export const PERMISSIONS = {
  DESTINATIONS: {
    CREATE: 'destinations:create',
    READ: 'destinations:read',
    UPDATE: 'destinations:update',
    DELETE: 'destinations:delete',
  },
  PACKAGES: {
    CREATE: 'packages:create',
    READ: 'packages:read',
    UPDATE: 'packages:update',
    DELETE: 'packages:delete',
  },
  BOOKINGS: {
    CREATE: 'bookings:create',
    READ: 'bookings:read',
    UPDATE: 'bookings:update',
    DELETE: 'bookings:delete',
  },
  PARTNERS: {
    CREATE: 'partners:create',
    READ: 'partners:read',
    UPDATE: 'partners:update',
    DELETE: 'partners:delete',
  },
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  SETTINGS: {
    CREATE: 'settings:create',
    READ: 'settings:read',
    UPDATE: 'settings:update',
    DELETE: 'settings:delete',
  },
} as const;

// =====================================================
// Role Hierarchy
// =====================================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.STAFF]: 1,
  [UserRole.PARTNER]: 0,
  [UserRole.GUEST]: 0,
};

// =====================================================
// Default Role Permissions
// =====================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    PERMISSIONS.DESTINATIONS.CREATE,
    PERMISSIONS.DESTINATIONS.READ,
    PERMISSIONS.DESTINATIONS.UPDATE,
    PERMISSIONS.DESTINATIONS.DELETE,
    PERMISSIONS.PACKAGES.CREATE,
    PERMISSIONS.PACKAGES.READ,
    PERMISSIONS.PACKAGES.UPDATE,
    PERMISSIONS.PACKAGES.DELETE,
    PERMISSIONS.BOOKINGS.CREATE,
    PERMISSIONS.BOOKINGS.READ,
    PERMISSIONS.BOOKINGS.UPDATE,
    PERMISSIONS.BOOKINGS.DELETE,
    PERMISSIONS.PARTNERS.CREATE,
    PERMISSIONS.PARTNERS.READ,
    PERMISSIONS.PARTNERS.UPDATE,
    PERMISSIONS.PARTNERS.DELETE,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
    PERMISSIONS.SETTINGS.CREATE,
    PERMISSIONS.SETTINGS.READ,
    PERMISSIONS.SETTINGS.UPDATE,
    PERMISSIONS.SETTINGS.DELETE,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.DESTINATIONS.CREATE,
    PERMISSIONS.DESTINATIONS.READ,
    PERMISSIONS.DESTINATIONS.UPDATE,
    PERMISSIONS.DESTINATIONS.DELETE,
    PERMISSIONS.PACKAGES.CREATE,
    PERMISSIONS.PACKAGES.READ,
    PERMISSIONS.PACKAGES.UPDATE,
    PERMISSIONS.PACKAGES.DELETE,
    PERMISSIONS.BOOKINGS.READ,
    PERMISSIONS.BOOKINGS.UPDATE,
    PERMISSIONS.PARTNERS.CREATE,
    PERMISSIONS.PARTNERS.READ,
    PERMISSIONS.PARTNERS.UPDATE,
    PERMISSIONS.SETTINGS.READ,
    PERMISSIONS.SETTINGS.UPDATE,
  ],
  [UserRole.STAFF]: [
    PERMISSIONS.DESTINATIONS.READ,
    PERMISSIONS.PACKAGES.READ,
    PERMISSIONS.BOOKINGS.READ,
    PERMISSIONS.BOOKINGS.UPDATE,
    PERMISSIONS.PARTNERS.READ,
  ],
  [UserRole.PARTNER]: [],
  [UserRole.GUEST]: [],
};
