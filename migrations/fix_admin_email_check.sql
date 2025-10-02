-- Alternative RLS policy solution (if not using service role key)
-- Add this policy to allow admin email checks

CREATE POLICY "Allow admin email check" ON public.profiles
    FOR SELECT USING (
        -- Allow checking if an email is admin (for authentication purposes)
        EXISTS (
            SELECT 1 FROM public.profiles p2 
            WHERE p2.email = profiles.email 
            AND p2.is_admin = true
        )
    );
