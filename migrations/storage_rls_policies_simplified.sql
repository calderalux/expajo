-- Storage RLS Policies for File Management
-- This file contains helper functions and instructions for Supabase Storage RLS

-- Note: Storage policies must be created through Supabase Dashboard
-- Go to: Authentication > Policies > storage.objects

-- Helper Functions (these can be run directly)

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's role level
CREATE OR REPLACE FUNCTION get_user_role_level()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((
    SELECT role_level FROM admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get file statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  files_by_folder JSONB,
  files_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_files,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_size,
    jsonb_object_agg(
      COALESCE(storage.foldername(name), 'root'), 
      folder_count
    ) as files_by_folder,
    jsonb_object_agg(file_type, type_count) as files_by_type
  FROM (
    SELECT 
      name,
      metadata,
      storage.foldername(name) as folder_name,
      CASE 
        WHEN metadata->>'mimetype' LIKE 'image/%' THEN 'image'
        WHEN metadata->>'mimetype' LIKE 'video/%' THEN 'video'
        WHEN metadata->>'mimetype' LIKE 'audio/%' THEN 'audio'
        WHEN metadata->>'mimetype' LIKE 'application/pdf' THEN 'pdf'
        ELSE 'other'
      END as file_type,
      COUNT(*) OVER (PARTITION BY storage.foldername(name)) as folder_count,
      COUNT(*) OVER (PARTITION BY CASE 
        WHEN metadata->>'mimetype' LIKE 'image/%' THEN 'image'
        WHEN metadata->>'mimetype' LIKE 'video/%' THEN 'video'
        WHEN metadata->>'mimetype' LIKE 'audio/%' THEN 'audio'
        WHEN metadata->>'mimetype' LIKE 'application/pdf' THEN 'pdf'
        ELSE 'other'
      END) as type_count
    FROM storage.objects
    WHERE bucket_id = 'images'
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the stats function
GRANT EXECUTE ON FUNCTION get_storage_stats() TO authenticated;

-- Create a view for easier file management queries
CREATE OR REPLACE VIEW admin_file_view AS
SELECT 
  o.id,
  o.name,
  o.bucket_id,
  o.owner,
  o.created_at,
  o.updated_at,
  o.last_accessed_at,
  o.metadata,
  storage.foldername(o.name) as folder_name,
  CASE 
    WHEN o.metadata->>'mimetype' LIKE 'image/%' THEN 'image'
    WHEN o.metadata->>'mimetype' LIKE 'video/%' THEN 'video'
    WHEN o.metadata->>'mimetype' LIKE 'audio/%' THEN 'audio'
    WHEN o.metadata->>'mimetype' LIKE 'application/pdf' THEN 'pdf'
    ELSE 'other'
  END as file_type,
  (o.metadata->>'size')::bigint as file_size
FROM storage.objects o
WHERE o.bucket_id = 'images';

-- Grant access to the view
GRANT SELECT ON admin_file_view TO authenticated;

-- MANUAL POLICY CREATION INSTRUCTIONS:
-- 
-- Go to Supabase Dashboard > Authentication > Policies
-- Select "storage.objects" table
-- Create the following policies manually:

-- 1. Admin can view all files (SELECT)
-- Target roles: authenticated
-- USING expression: is_admin_user()

-- 2. Admin can upload files (INSERT) 
-- Target roles: authenticated
-- WITH CHECK expression: is_admin_user()

-- 3. Admin can update files (UPDATE)
-- Target roles: authenticated
-- USING expression: is_admin_user()
-- WITH CHECK expression: is_admin_user()

-- 4. Admin can delete files (DELETE)
-- Target roles: authenticated
-- USING expression: is_admin_user()

-- 5. Public can view files (SELECT)
-- Target roles: anon
-- USING expression: bucket_id = 'images'

-- Optional: Role-based policies
-- 6. Super admin full access (ALL)
-- Target roles: authenticated
-- USING expression: get_user_role_level() >= 3
-- WITH CHECK expression: get_user_role_level() >= 3

-- 7. Admin limited access (ALL)
-- Target roles: authenticated
-- USING expression: get_user_role_level() >= 2 AND (storage.foldername(name) IN ('destinations', 'packages', 'experiences', 'temp') OR storage.foldername(name) = '')
-- WITH CHECK expression: get_user_role_level() >= 2 AND (storage.foldername(name) IN ('destinations', 'packages', 'experiences', 'temp') OR storage.foldername(name) = '')

-- 8. Staff temp folder access (ALL)
-- Target roles: authenticated
-- USING expression: get_user_role_level() >= 1 AND storage.foldername(name) = 'temp'
-- WITH CHECK expression: get_user_role_level() >= 1 AND storage.foldername(name) = 'temp'
