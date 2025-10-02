-- RLS policies for admin_sessions table
-- These policies allow server-side operations with service role key

-- Enable RLS on admin_sessions table
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations for service role (bypasses RLS)
CREATE POLICY "admin_sessions_service_role_all" ON public.admin_sessions
    FOR ALL USING (true)
    WITH CHECK (true);

-- Policy to allow authenticated users to read their own sessions
CREATE POLICY "admin_sessions_user_read_own" ON public.admin_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = admin_sessions.user_id 
            AND p.id = auth.uid()
        )
    );

-- Policy to allow admin users to read all sessions
CREATE POLICY "admin_sessions_admin_read_all" ON public.admin_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = admin_sessions.user_id 
            AND p.is_admin = true
        )
    );
