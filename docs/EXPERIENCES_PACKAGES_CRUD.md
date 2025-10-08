# Experiences & Packages CRUD Implementation

This document outlines the comprehensive CRUD functionality implemented for both experiences and packages entities with proper RBAC, caching, and admin interfaces.

## 🏗️ System Architecture

### Database Schema
Both entities follow the existing Supabase schema with proper relationships:
- **Experiences**: Standalone entity with categories, pricing, and features
- **Packages**: Related to destinations and partners with complex pricing and itinerary data

### Role-Based Access Control (RBAC)
- **Staff**: Update only (soft delete by setting is_active/is_published to false)
- **Admin**: Create, Update only
- **Super Admin**: Create, Update and Delete only (hard delete)
- **Public**: Read active/published entities only

## 🔐 RLS Policies

### Experiences Policies
```sql
-- Public read access to active experiences
CREATE POLICY "exp_public_read" ON experiences FOR SELECT USING (is_active = true);

-- Staff can update experiences
CREATE POLICY "exp_staff_update" ON experiences FOR UPDATE USING (is_staff_or_admin());

-- Admin can create and update experiences
CREATE POLICY "exp_admin_create" ON experiences FOR INSERT USING (is_admin());
CREATE POLICY "exp_admin_update" ON experiences FOR UPDATE USING (is_admin());

-- Super admin can delete experiences
CREATE POLICY "exp_super_admin_delete" ON experiences FOR DELETE USING (is_super_admin());

-- Admin can read all experiences (including inactive)
CREATE POLICY "exp_admin_read_all" ON experiences FOR SELECT USING (is_admin());
```

### Packages Policies
```sql
-- Public read access to published packages
CREATE POLICY "pkg_public_read" ON packages FOR SELECT USING (is_published = true);

-- Staff can update packages
CREATE POLICY "pkg_staff_update" ON packages FOR UPDATE USING (is_staff_or_admin());

-- Admin can create and update packages
CREATE POLICY "pkg_admin_create" ON packages FOR INSERT USING (is_admin());
CREATE POLICY "pkg_admin_update" ON packages FOR UPDATE USING (is_admin());

-- Super admin can delete packages
CREATE POLICY "pkg_super_admin_delete" ON packages FOR DELETE USING (is_super_admin());

-- Admin can read all packages (including unpublished)
CREATE POLICY "pkg_admin_read_all" ON packages FOR SELECT USING (is_admin());
```

## 🚀 API Endpoints

### Experiences API

#### Admin Endpoints (Protected)
```
GET /api/admin/experiences
- List all experiences with filtering and pagination
- Query params: page, limit, category, location, is_active, sort_by, sort_order

POST /api/admin/experiences
- Create new experience (admin only)
- Body: ExperienceInsert schema

GET /api/admin/experiences/[id]
- Get single experience by ID (admin only)

PUT /api/admin/experiences/[id]
- Update experience (admin/staff only)
- Body: ExperienceUpdate schema

DELETE /api/admin/experiences/[id]
- Delete experience (super admin only)
```

#### Public Endpoints (Cached)
```
GET /api/experiences/public
- Get public experiences with filtering
- Query params: limit, category, location, min_price, max_price, min_rating, featured, sort_by, sort_order
- Cached for 30 minutes
```

### Packages API

#### Admin Endpoints (Protected)
```
GET /api/admin/packages
- List all packages with filtering and pagination
- Query params: page, limit, destination_id, category, featured, luxury_certified, is_published, currency, sort_by, sort_order

POST /api/admin/packages
- Create new package (admin only)
- Body: PackageInsert schema

GET /api/admin/packages/[id]
- Get single package by ID (admin only)

PUT /api/admin/packages/[id]
- Update package (admin/staff only)
- Body: PackageUpdate schema

DELETE /api/admin/packages/[id]
- Delete package (super admin only)
```

#### Public Endpoints (Cached)
```
GET /api/packages/public
- Get public packages with filtering
- Query params: limit, destination_id, category, featured, luxury_certified, min_price, max_price, min_rating, currency, sort_by, sort_order
- Cached for 30 minutes
```

## 🎨 Admin Interfaces

### Experiences Management (`/admin/experiences`)
- **Grid Layout**: Card-based display with images, pricing, and status indicators
- **Filtering**: Search, category, status, and sorting options
- **Actions**: Create, edit, activate/deactivate, delete (role-based)
- **Form Modal**: Comprehensive form with validation for all experience fields
- **Status Management**: Visual indicators for active/inactive and featured status

### Packages Management (`/admin/packages`)
- **Grid Layout**: Card-based display with destination images and pricing
- **Filtering**: Search, category, status, currency, and sorting options
- **Actions**: Create, edit, publish/unpublish, delete (role-based)
- **Form Modal**: Comprehensive form with validation for all package fields
- **Status Management**: Visual indicators for published/unpublished, featured, and luxury certified status

### Form Features
- **Validation**: Client-side and server-side validation with Zod schemas
- **Dynamic Fields**: Add/remove image URLs and features/inclusions/exclusions
- **Status Toggles**: Checkboxes for featured, active/published status
- **Relationship Management**: Destination and partner selection
- **Pricing**: Base price, currency, and discount percentage

## 💾 Caching Implementation

### Service-Level Caching
All data services include automatic caching with appropriate TTLs:

#### Experiences Caching
- **List queries**: 30 minutes TTL
- **Individual items**: 1 hour TTL
- **Featured experiences**: 30 minutes TTL
- **Category queries**: 30 minutes TTL
- **Search results**: 15 minutes TTL

#### Packages Caching
- **List queries**: 30 minutes TTL
- **Individual items**: 1 hour TTL
- **Featured packages**: 30 minutes TTL
- **Destination queries**: 30 minutes TTL
- **Search results**: 15 minutes TTL

### Cache Invalidation
Automatic cache invalidation on data changes:
- **Create operations**: Invalidate related caches
- **Update operations**: Invalidate related caches
- **Delete operations**: Invalidate related caches
- **Status changes**: Invalidate related caches

### Cache Keys Structure
```
expajo:experiences:all:{filters}:{sort}:{limit}
expajo:experiences:id:{id}
expajo:experiences:featured:{limit}
expajo:experiences:category:{category}:{limit}
expajo:experiences:search:{term}:{limit}

expajo:packages:all:{filters}:{sort}:{limit}
expajo:packages:id:{id}
expajo:packages:featured:{limit}
expajo:packages:destination:{destinationId}:{limit}
expajo:packages:search:{term}:{limit}
```

## 🎯 Frontend Integration

### Homepage Sections
- **ExperiencesSection**: Now uses `ExperienceService.getFeaturedExperiences(6)` with proper error handling
- **FeaturedPackagesSection**: Now uses `PackageService.getFeaturedPackages(3)` with proper error handling
- **Error States**: Graceful fallbacks with retry options
- **Loading States**: Skeleton loaders during data fetching
- **Empty States**: User-friendly messages with navigation options

### Public Pages
- **Experiences Page**: Uses dynamic data from API with filtering and pagination
- **Packages Page**: Uses dynamic data from API with filtering and pagination
- **Detail Modals**: Display real data from database

### Admin Navigation
- **Sidebar Menu**: Added "Experiences" and "Packages" links with proper permissions
- **Dashboard Stats**: Real-time counts from API
- **Quick Actions**: Direct links to create new entities

## 🔧 Service Layer

### ExperienceService
```typescript
// Public methods
static async getExperiences(filters?, sort?, limit?)
static async getExperienceById(id)
static async getFeaturedExperiences(limit)
static async getExperiencesByCategory(category, limit?)
static async searchExperiences(searchTerm, limit?)

// Admin methods
static async createExperience(experience)
static async updateExperience(id, updates)
static async deleteExperience(id) // Hard delete
static async deactivateExperience(id) // Soft delete
static async reactivateExperience(id) // Reactivate
```

### PackageService
```typescript
// Public methods
static async getPackages(filters?, sort?, limit?)
static async getPackageById(id)
static async getFeaturedPackages(limit)
static async getPackagesByDestination(destinationId, limit?)
static async getPackagesByCategory(category, limit?)
static async searchPackages(searchTerm, limit?)

// Admin methods
static async createPackage(package_)
static async updatePackage(id, updates)
static async deletePackage(id) // Hard delete
static async unpublishPackage(id) // Soft delete
static async publishPackage(id) // Publish
```

## 🛡️ Security Features

### Authentication & Authorization
- **Session-based**: Admin authentication with secure session tokens
- **Role-based**: Permission checks for all operations
- **RLS Policies**: Database-level security enforcement
- **Input Validation**: Zod schemas for all API endpoints

### Data Protection
- **Soft Deletes**: Preferred over hard deletes for data integrity
- **Audit Trail**: All operations logged (via existing audit system)
- **Input Sanitization**: Proper validation and sanitization
- **Error Handling**: Secure error messages without sensitive data exposure

## 📊 Performance Optimizations

### Database Optimizations
- **Indexes**: Created on frequently queried columns
- **Query Optimization**: Efficient joins and filtering
- **Pagination**: Proper limit/offset implementation

### Caching Strategy
- **Redis Integration**: Server-side caching with Redis
- **Cache Warming**: Pre-populate frequently accessed data
- **Cache Invalidation**: Smart invalidation on data changes
- **TTL Management**: Appropriate cache lifetimes

### Frontend Optimizations
- **Lazy Loading**: Components loaded on demand
- **Skeleton Loaders**: Better perceived performance
- **Error Boundaries**: Graceful error handling
- **Optimistic Updates**: Immediate UI feedback

## 🧪 Testing Considerations

### Unit Tests
- Service layer methods
- Validation schemas
- Cache operations
- Error handling

### Integration Tests
- API endpoint functionality
- Database operations
- Cache invalidation
- Permission checks

### Manual Testing
- Admin interface workflows
- Permission-based access
- Cache behavior
- Error scenarios

## 🚀 Deployment Notes

### Database Migrations
1. Run `migrations/experiences_rbac_policies.sql`
2. Run `migrations/packages_rbac_policies.sql`
3. Verify RLS policies are active
4. Test permission functions

### Environment Variables
- Ensure Redis is configured for caching
- Verify Supabase service role key is available
- Check admin session configuration

### Monitoring
- Cache hit rates
- API response times
- Error rates
- Database query performance

## 📝 Future Enhancements

### Planned Features
1. **Bulk Operations**: Bulk create, update, delete
2. **Advanced Filtering**: More sophisticated filter options
3. **Export/Import**: CSV/JSON data export and import
4. **Audit Dashboard**: Visual audit trail interface
5. **Real-time Updates**: WebSocket-based live updates

### Performance Improvements
1. **Database Optimization**: Query optimization and indexing
2. **Cache Strategies**: More sophisticated caching patterns
3. **CDN Integration**: Image and static asset optimization
4. **Search Enhancement**: Full-text search capabilities

This implementation provides a robust, scalable foundation for managing experiences and packages with proper security, performance, and user experience considerations.
