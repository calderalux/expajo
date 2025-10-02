-- =====================================================
-- RBAC System Database Changes for Phase 1
-- =====================================================

-- 1. Update app_roles table to support hierarchical roles
-- Current: only 'admin' role
-- Required: 'super_admin', 'admin', 'staff' roles

-- Add new role types
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Or create new enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'staff', 'partner', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update app_roles table structure
CREATE TABLE IF NOT EXISTS public.app_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- 3. Create role_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role user_role NOT NULL,
    resource VARCHAR(100) NOT NULL, -- e.g., 'destinations', 'packages', 'bookings'
    action VARCHAR(50) NOT NULL,    -- e.g., 'create', 'read', 'update', 'delete'
    conditions JSONB DEFAULT '{}', -- Additional conditions for the permission
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, resource, action)
);

-- 4. Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create otp_codes table for OTP authentication
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'admin_login', 'password_reset', etc.
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Update profiles table to include admin-specific fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_level INTEGER DEFAULT 0, -- 0=guest, 1=staff, 2=admin, 3=super_admin
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- 7. Create audit_logs table for admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create admin_settings table for system configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_app_roles_user_id ON public.app_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_app_roles_role ON public.app_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON public.otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(key);

-- =====================================================
-- RLS Policies for New Tables
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- app_roles policies
CREATE POLICY "Users can view their own roles" ON public.app_roles
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage all roles" ON public.app_roles
    FOR ALL USING (is_admin());

-- role_permissions policies
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (is_admin());

-- admin_sessions policies
CREATE POLICY "Users can view their own sessions" ON public.admin_sessions
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can manage their own sessions" ON public.admin_sessions
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- otp_codes policies
CREATE POLICY "Users can view their own OTP codes" ON public.otp_codes
    FOR SELECT USING (email = auth.jwt() ->> 'email' OR is_admin());

CREATE POLICY "System can manage OTP codes" ON public.otp_codes
    FOR ALL USING (true); -- OTP codes are managed by system functions

-- audit_logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (is_admin());

CREATE POLICY "System can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- admin_settings policies
CREATE POLICY "Public settings are viewable by all" ON public.admin_settings
    FOR SELECT USING (is_public = true OR is_admin());

CREATE POLICY "Admins can manage all settings" ON public.admin_settings
    FOR ALL USING (is_admin());

-- =====================================================
-- Functions for RBAC
-- =====================================================

-- Enhanced is_admin function to support role hierarchy
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_roles ar
        JOIN public.profiles p ON p.id = ar.user_id
        WHERE ar.user_id = auth.uid() 
        AND ar.role IN ('admin', 'super_admin')
        AND ar.is_active = true
        AND p.is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_roles
        WHERE user_id = auth.uid() 
        AND role = role_name
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(resource_name VARCHAR, action_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_roles ar
        JOIN public.role_permissions rp ON rp.role = ar.role
        WHERE ar.user_id = auth.uid()
        AND ar.is_active = true
        AND rp.resource = resource_name
        AND rp.action = action_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's highest role level
CREATE OR REPLACE FUNCTION public.get_user_role_level()
RETURNS INTEGER AS $$
DECLARE
    max_level INTEGER := 0;
BEGIN
    SELECT COALESCE(MAX(
        CASE ar.role
            WHEN 'super_admin' THEN 3
            WHEN 'admin' THEN 2
            WHEN 'staff' THEN 1
            ELSE 0
        END
    ), 0) INTO max_level
    FROM public.app_roles ar
    WHERE ar.user_id = auth.uid() AND ar.is_active = true;
    
    RETURN max_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Default Data Setup
-- =====================================================

-- Insert default role permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
-- Super Admin - Full access to everything
('super_admin', 'destinations', 'create'),
('super_admin', 'destinations', 'read'),
('super_admin', 'destinations', 'update'),
('super_admin', 'destinations', 'delete'),
('super_admin', 'packages', 'create'),
('super_admin', 'packages', 'read'),
('super_admin', 'packages', 'update'),
('super_admin', 'packages', 'delete'),
('super_admin', 'bookings', 'create'),
('super_admin', 'bookings', 'read'),
('super_admin', 'bookings', 'update'),
('super_admin', 'bookings', 'delete'),
('super_admin', 'partners', 'create'),
('super_admin', 'partners', 'read'),
('super_admin', 'partners', 'update'),
('super_admin', 'partners', 'delete'),
('super_admin', 'users', 'create'),
('super_admin', 'users', 'read'),
('super_admin', 'users', 'update'),
('super_admin', 'users', 'delete'),
('super_admin', 'settings', 'create'),
('super_admin', 'settings', 'read'),
('super_admin', 'settings', 'update'),
('super_admin', 'settings', 'delete'),

-- Admin - Most permissions except user management
('admin', 'destinations', 'create'),
('admin', 'destinations', 'read'),
('admin', 'destinations', 'update'),
('admin', 'destinations', 'delete'),
('admin', 'packages', 'create'),
('admin', 'packages', 'read'),
('admin', 'packages', 'update'),
('admin', 'packages', 'delete'),
('admin', 'bookings', 'read'),
('admin', 'bookings', 'update'),
('admin', 'partners', 'create'),
('admin', 'partners', 'read'),
('admin', 'partners', 'update'),
('admin', 'settings', 'read'),
('admin', 'settings', 'update'),

-- Staff - Limited permissions
('staff', 'destinations', 'read'),
('staff', 'packages', 'read'),
('staff', 'bookings', 'read'),
('staff', 'bookings', 'update'),
('staff', 'partners', 'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value, description, category) VALUES
('site_name', '"Expajo"', 'The name of the website', 'general'),
('site_description', '"Premium Travel Experiences"', 'Site description for SEO', 'general'),
('admin_email', '"admin@expajo.com"', 'Primary admin email', 'contact'),
('otp_expiry_minutes', '10', 'OTP code expiry time in minutes', 'security'),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security'),
('session_timeout_hours', '8', 'Admin session timeout in hours', 'security'),
('enable_audit_logging', 'true', 'Enable audit logging for admin actions', 'security')
ON CONFLICT (key) DO NOTHING;
