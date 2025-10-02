# Admin Authentication & Authorization System - Phase 1

This document outlines the comprehensive authentication and authorization system implemented for admin users in Phase 1 of the Expajo platform.

## 🏗️ System Architecture

### Database Schema Changes

The RBAC system extends the existing database with the following new tables and modifications:

#### New Tables:
- `app_roles` - User role assignments with hierarchical permissions
- `role_permissions` - Granular permissions for each role and resource
- `admin_sessions` - Secure session management for admin users
- `otp_codes` - OTP code storage and validation
- `audit_logs` - Comprehensive audit trail for admin actions
- `admin_settings` - System configuration management

#### Enhanced Tables:
- `profiles` - Added admin-specific fields (is_admin, admin_level, etc.)

### Role Hierarchy

```
Super Admin (Level 3)
├── Full system access
├── User management
├── System settings
└── Audit logs

Admin (Level 2)
├── Content management
├── Booking management
├── Partner management
└── Limited settings access

Staff (Level 1)
├── Read-only access
├── Basic booking updates
└── Limited content viewing

Guest (Level 0)
└── No admin access
```

## 🔐 Authentication Flow

### OTP-Based Admin Login

1. **Email Verification**: Admin enters email address
2. **OTP Generation**: System generates 6-digit OTP code
3. **Email Delivery**: OTP sent to admin's email (10-minute expiry)
4. **Code Verification**: Admin enters OTP code
5. **Session Creation**: Secure session token generated (8-hour expiry)
6. **Dashboard Access**: Redirected to admin dashboard

### Security Features

- **OTP Expiry**: 10-minute window for code validity
- **Attempt Limiting**: Maximum 3 attempts per OTP code
- **Session Management**: Secure HTTP-only cookies
- **IP Tracking**: Session IP address logging
- **Audit Logging**: All admin actions logged

## 🛡️ Authorization System

### Permission-Based Access Control

Each role has specific permissions for different resources:

```typescript
PERMISSIONS = {
  DESTINATIONS: ['create', 'read', 'update', 'delete'],
  PACKAGES: ['create', 'read', 'update', 'delete'],
  BOOKINGS: ['create', 'read', 'update', 'delete'],
  PARTNERS: ['create', 'read', 'update', 'delete'],
  USERS: ['create', 'read', 'update', 'delete'],
  SETTINGS: ['create', 'read', 'update', 'delete'],
}
```

### RLS Policy Integration

The system leverages existing RLS policies and extends them with new admin-specific policies:

- **Admin Override**: `is_admin()` function provides full access
- **Role-Based Access**: `has_role()` and `has_permission()` functions
- **Hierarchical Permissions**: Higher-level roles inherit lower-level permissions

## 🎨 User Interface Components

### Authentication Components

#### `AdminLoginForm`
- Two-step OTP authentication
- Real-time validation and error handling
- Responsive design with mobile support
- Countdown timer for OTP expiry

#### `AuthGuard`
- Route protection middleware
- Session validation
- Automatic redirect handling
- Permission-based component rendering

### Dashboard Components

#### `AdminDashboard`
- Role-based navigation menu
- Permission-gated quick actions
- Real-time statistics display
- Responsive sidebar navigation

## 🔧 API Endpoints

### Authentication Endpoints

```
POST /api/admin/auth/otp
- Request OTP code for admin login
- Body: { email: string, purpose: 'admin_login' }

POST /api/admin/auth/login
- Verify OTP and create session
- Body: { email: string, otp: string }

GET /api/admin/auth/me
- Get current admin user profile
- Headers: Cookie with session token

POST /api/admin/auth/logout
- Invalidate session and logout
- Headers: Cookie with session token
```

### Management Endpoints

```
GET /api/admin/users
- List all users with pagination
- Query params: page, limit, role, search

POST /api/admin/users
- Create new user
- Body: { email, full_name, role, is_admin }

PUT /api/admin/users/[id]
- Update user profile and role
- Body: { full_name, is_admin, admin_level, role }

DELETE /api/admin/users/[id]
- Soft delete user (deactivate)
- Params: user ID

GET /api/admin/settings
- Get system settings by category
- Query params: category, public

POST /api/admin/settings
- Create or update setting
- Body: { key, value, description, category, is_public }

DELETE /api/admin/settings/[key]
- Delete setting
- Params: setting key
```

## 🚀 Implementation Guide

### 1. Database Setup

Run the migration script to set up the RBAC system:

```sql
-- Execute migrations/rbac_system_setup.sql
-- This creates all necessary tables, indexes, and policies
```

### 2. Environment Configuration

Add Redis configuration for caching:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

### 3. Email Service Integration

Implement email service for OTP delivery:

```typescript
// In AuthService.sendOtpEmail()
await emailService.sendOtp({
  to: email,
  code,
  purpose,
  expiresIn: 10, // minutes
});
```

### 4. Admin User Creation

Create initial admin users:

```sql
-- Insert admin profile
INSERT INTO profiles (email, is_admin, admin_level) 
VALUES ('admin@expajo.com', true, 3);

-- Assign super admin role
INSERT INTO app_roles (user_id, role) 
VALUES (
  (SELECT id FROM profiles WHERE email = 'admin@expajo.com'),
  'super_admin'
);
```

## 🔍 Usage Examples

### Frontend Integration

```typescript
// Protect admin routes
<AuthGuard>
  <AdminDashboard />
</AuthGuard>

// Check permissions
const { hasPermission } = usePermission('destinations', 'create');
if (hasPermission) {
  // Show create destination button
}

// Get user role level
const { roleLevel } = useRoleLevel();
if (roleLevel >= 2) {
  // Show admin features
}
```

### API Integration

```typescript
// Login flow
const otpResponse = await fetch('/api/admin/auth/otp', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@expajo.com' })
});

const loginResponse = await fetch('/api/admin/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@expajo.com', otp: '123456' })
});

// Authenticated requests
const usersResponse = await fetch('/api/admin/users', {
  headers: {
    'Cookie': 'admin_session_token=...'
  }
});
```

## 📊 Monitoring & Analytics

### Cache Performance

Monitor Redis cache performance:

```bash
# Check cache health
curl http://localhost:3000/api/cache/health

# Get cache statistics
curl http://localhost:3000/api/cache/stats

# Test cache functionality
curl http://localhost:3000/api/cache/test
```

### Audit Logging

All admin actions are automatically logged:

- User login/logout events
- Data modifications
- Permission changes
- System configuration updates

## 🔒 Security Considerations

### Best Practices

1. **Session Security**
   - HTTP-only cookies prevent XSS attacks
   - Secure flag in production
   - SameSite protection against CSRF

2. **OTP Security**
   - Short expiry window (10 minutes)
   - Limited attempts (3 max)
   - Secure random generation

3. **Permission Validation**
   - Server-side permission checks
   - RLS policy enforcement
   - Audit trail for all actions

4. **Data Protection**
   - Sensitive data encryption
   - Secure password hashing
   - Regular security audits

## 🚧 Future Enhancements (Phase 2+)

### Planned Features

1. **Customer Authentication**
   - Username/password login
   - Social authentication
   - Email verification

2. **Partner Authentication**
   - Partner ID + OTP system
   - Partner-specific dashboard
   - Commission tracking

3. **Advanced Security**
   - Two-factor authentication
   - Device management
   - Suspicious activity detection

4. **Enhanced RBAC**
   - Custom permission sets
   - Temporary role assignments
   - Delegation capabilities

## 📝 Testing

### Test Commands

```bash
# Start Redis for caching
npm run redis:start

# Test authentication flow
npm run cache:test

# Check system health
npm run cache:health

# View cache statistics
npm run cache:stats
```

### Manual Testing

1. **OTP Flow**
   - Request OTP with valid admin email
   - Verify OTP code acceptance
   - Test expired OTP rejection
   - Test invalid OTP handling

2. **Permission System**
   - Test role-based access control
   - Verify permission inheritance
   - Check unauthorized access blocking

3. **Session Management**
   - Test session creation and validation
   - Verify logout functionality
   - Check session expiry handling

## 🎯 Performance Metrics

### Target Performance

- **OTP Delivery**: < 5 seconds
- **Login Response**: < 2 seconds
- **Permission Checks**: < 100ms
- **Dashboard Load**: < 3 seconds
- **Cache Hit Rate**: > 80%

### Monitoring

- Redis cache performance
- Database query optimization
- API response times
- User session analytics
- Error rate tracking

This authentication and authorization system provides a robust, scalable foundation for admin user management while maintaining security best practices and performance optimization.
