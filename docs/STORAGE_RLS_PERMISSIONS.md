# Supabase Storage RLS and Permissions

This document explains the Row Level Security (RLS) policies and permissions system implemented for Supabase Storage file management.

## Overview

The file management system implements comprehensive RLS policies to ensure secure access to files in Supabase Storage, with role-based permissions for different admin levels.

## RLS Policies

### 1. Admin Access Policies

All admin policies check if the user is an authenticated admin user:

```sql
-- Helper function to check admin status
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
```

### 2. Role-Based Policies

The system implements three permission levels:

#### **Super Admin (Level 3)**
- Full access to all files and folders
- Can manage any file in any location
- Can delete any file

#### **Admin (Level 2)**
- Can manage files in specific folders: `destinations`, `packages`, `experiences`, `temp`
- Can upload, view, and delete files in allowed folders
- Cannot access restricted folders like `users`

#### **Staff (Level 1)**
- Can only view and upload to `temp` folder
- Cannot delete files
- Limited access for content creation workflows

### 3. Public Access

```sql
-- Public can view files (for public URLs)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'images');
```

## Permission Structure

### Database Functions

```sql
-- Get user's role level
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
```

### API Permission Checks

The system includes API endpoints for permission verification:

- `GET /api/admin/files/permissions` - Get user permissions
- `GET /api/admin/files/stats` - Get storage statistics (admin only)

## Security Features

### 1. Authentication Required
- All file operations require valid admin session token
- Session tokens are validated against the database
- Expired or invalid tokens are rejected

### 2. Role-Based Access Control
- Different permission levels for different admin roles
- Folder-specific access restrictions
- Action-specific permissions (view, upload, delete)

### 3. File Validation
- File type validation (images only)
- File size limits (10MB maximum)
- Path sanitization to prevent directory traversal

### 4. Audit Trail
- All file operations are logged
- User actions are tracked with timestamps
- Failed access attempts are recorded

## Implementation Details

### Frontend Permission Checks

```typescript
interface UserPermissions {
  canView: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canManageAll: boolean;
}
```

The FileManager component checks permissions before showing UI elements:

```typescript
// Upload button only shown if user can upload
{permissions.canUpload && (
  <Button onClick={openUploadModal}>
    Upload File
  </Button>
)}

// Delete actions only shown if user can delete
{permissions.canDelete && (
  <ActionIcon onClick={handleDeleteFile}>
    <IconTrash />
  </ActionIcon>
)}
```

### Backend Permission Validation

All API endpoints validate permissions:

```typescript
// Check admin authentication
const session = await checkAdminAuth(request);
if (!session.success) {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

// Check role level
const { data: userRole } = await supabase.rpc('get_user_role_level');
if (userRole < requiredLevel) {
  return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
}
```

## Folder Structure and Permissions

### Allowed Folders by Role

| Role Level | Folders | Actions |
|------------|---------|---------|
| Super Admin (3) | All folders | Full access |
| Admin (2) | `destinations`, `packages`, `experiences`, `temp`, root | Upload, view, delete |
| Staff (1) | `temp` only | Upload, view |

### Folder Restrictions

- **`users`**: Only Super Admins can access
- **`temp`**: All authenticated users can access
- **`destinations`**: Admin level and above
- **`packages`**: Admin level and above
- **`experiences`**: Admin level and above

## Storage Statistics

The system provides comprehensive storage statistics:

```sql
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  files_by_folder JSONB,
  files_by_type JSONB
) AS $$
-- Implementation details...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Statistics Include:
- Total file count
- Total storage used
- Files by folder breakdown
- Files by type breakdown
- Formatted file sizes

## Best Practices

### 1. Permission Checks
- Always check permissions on both frontend and backend
- Use RLS policies as the primary security layer
- Implement additional API-level checks for sensitive operations

### 2. File Organization
- Use appropriate folders for different content types
- Implement naming conventions for files
- Regular cleanup of temporary files

### 3. Security Monitoring
- Monitor failed access attempts
- Log all file operations
- Regular audit of permissions

### 4. Performance
- Use indexes on frequently queried columns
- Implement pagination for large file lists
- Cache permission checks when appropriate

## Migration and Setup

To apply the RLS policies:

1. Run the migration file:
```bash
psql -d your_database -f migrations/storage_rls_policies.sql
```

2. Verify policies are active:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

3. Test permissions with different user roles

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if user is in `admin_users` table
   - Verify `is_active` status
   - Check role level assignments

2. **RLS Policy Conflicts**
   - Ensure policies don't conflict
   - Check policy order and precedence
   - Verify function definitions

3. **Performance Issues**
   - Add indexes on frequently queried columns
   - Optimize RLS policy conditions
   - Consider caching strategies

### Debug Commands

```sql
-- Check current user's role level
SELECT get_user_role_level();

-- Check if user is admin
SELECT is_admin_user();

-- View active policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check storage statistics
SELECT * FROM get_storage_stats();
```

## Security Considerations

1. **Principle of Least Privilege**: Users only get minimum required permissions
2. **Defense in Depth**: Multiple layers of security (RLS, API checks, frontend validation)
3. **Regular Audits**: Periodic review of permissions and access patterns
4. **Secure Defaults**: Deny access by default, grant explicitly
5. **Input Validation**: All inputs are validated and sanitized

This comprehensive security system ensures that file management operations are secure, auditable, and properly restricted based on user roles and permissions.
