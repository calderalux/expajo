-- Storage RLS Policies for File Management
-- This file sets up proper Row Level Security for Supabase Storage

-- Note: RLS is already enabled on storage.objects by Supabase
-- These policies need to be created through Supabase Dashboard or as service role

-- Policy 1: Allow authenticated admin users to view all files
CREATE POLICY "Admin can view all files" ON storage.objects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  )
);

-- Policy 2: Allow authenticated admin users to upload files
CREATE POLICY "Admin can upload files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  )
);

-- Policy 3: Allow authenticated admin users to update files
CREATE POLICY "Admin can update files" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  )
);

-- Policy 4: Allow authenticated admin users to delete files
CREATE POLICY "Admin can delete files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM admin_users WHERE is_active = true
    )
  )
);

-- Policy 5: Allow public access to view files (for public URLs)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'images');

-- Alternative: More restrictive public access based on folder
-- CREATE POLICY "Public can view published files" ON storage.objects
-- FOR SELECT
-- TO anon
-- USING (
--   bucket_id = 'images' 
--   AND (storage.foldername(name) = 'public' OR storage.foldername(name) = 'destinations')
-- );

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
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

-- Enhanced policies using the helper functions
DROP POLICY IF EXISTS "Admin can view all files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;

-- Recreate policies with helper functions
CREATE POLICY "Admin can view all files" ON storage.objects
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admin can upload files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admin can update files" ON storage.objects
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete files" ON storage.objects
FOR DELETE
TO authenticated
USING (is_admin());

-- Optional: Role-based policies for different admin levels
-- Super Admin (level 3) can manage all files
CREATE POLICY "Super admin full access" ON storage.objects
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Regular Admin (level 2) can manage files in specific folders
CREATE POLICY "Admin limited access" ON storage.objects
FOR ALL
TO authenticated
USING (
  is_admin()
  AND (
    storage.foldername(name) IN ('destinations', 'packages', 'experiences', 'temp')
    OR storage.foldername(name) = ''
  )
)
WITH CHECK (
  is_admin() 
  AND (
    storage.foldername(name) IN ('destinations', 'packages', 'experiences', 'temp')
    OR storage.foldername(name) = ''
  )
);

-- Staff (level 1) can only view and upload to temp folder
CREATE POLICY "Staff temp folder access" ON storage.objects
FOR ALL
TO authenticated
USING (
  is_staff_or_admin()
  AND storage.foldername(name) = 'temp'
)
WITH CHECK (
  is_staff_or_admin()
  AND storage.foldername(name) = 'temp'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Grant permissions to anonymous users for public access
GRANT USAGE ON SCHEMA storage TO anon;
GRANT SELECT ON storage.objects TO anon;

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
