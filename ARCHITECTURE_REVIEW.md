# Expajo - Architectural Review & Project Summary

## 1. Project Overview

**Expajo** is a travel experience platform focused on short-term rentals, curated travel packages, and destination experiences — with a primary focus on **Nigerian destinations** (Lagos, Abuja, Calabar, etc.). It is not a generic Airbnb clone; it operates more as a **curated travel concierge** marketplace where administrators compose packages from partner services (accommodation, transportation, excursions, dining, etc.) and offer them to travelers.

The platform targets travelers who want pre-packaged, curated experiences rather than building trips from scratch. Think of it as a B2C travel marketplace with a strong admin/operations back-office.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v3 with custom design tokens |
| **UI Libraries** | HeroUI + Mantine (dual component library approach) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React + Tabler Icons |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Caching** | Redis (via ioredis) |
| **Email** | Nodemailer (SMTP) |
| **Forms** | TanStack Form + Zod validation |
| **Auth** | Custom OTP-based authentication (not Supabase Auth) |
| **File Parsing** | xlsx (for import/export) |
| **Testing** | Jest + React Testing Library |
| **Linting** | ESLint + Prettier |
| **Deployment Target** | Vercel (recommended), Docker-ready |

---

## 3. Architecture Overview

### 3.1 Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (public)
│   ├── auth/                     # User auth (login/register)
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── destinations/         # CRUD for destinations
│   │   ├── experiences/          # CRUD for experiences
│   │   ├── packages/             # CRUD for packages
│   │   ├── package-items/        # CRUD for service items
│   │   └── login/                # Admin OTP login
│   ├── destinations/             # Public destinations browse
│   ├── experiences/              # Public experiences browse
│   ├── search/                   # Property/package search
│   ├── listing/[id]/             # Individual listing detail
│   ├── account/                  # User account & bookings
│   └── api/                      # API route handlers
│       ├── admin/                # Admin-protected endpoints
│       │   ├── auth/             # OTP, login, session, permissions
│       │   ├── destinations/     # CRUD + bulk + import/export
│       │   ├── experiences/      # CRUD + import/export
│       │   ├── packages/         # CRUD + relationships
│       │   ├── package-items/    # Service item management
│       │   ├── package-item-options/  # Item option management
│       │   ├── settings/         # Admin settings
│       │   └── users/            # User management
│       ├── destinations/         # Public read-only endpoints
│       ├── experiences/          # Public read-only endpoints
│       ├── packages/             # Public read-only endpoints
│       ├── plan-requests/        # Customer trip planning form
│       └── cache/                # Cache health/stats/test
├── components/
│   ├── admin/                    # Admin UI components (data grid, filters, navigation)
│   ├── auth/                     # AuthGuard, AdminLoginForm
│   ├── forms/                    # Dynamic forms, modals for CRUD
│   ├── layout/                   # Header, Footer, Layout
│   ├── modals/                   # Detail views, import modals
│   ├── providers/                # Client providers (Mantine, Supabase)
│   ├── sections/                 # Landing page sections (Hero, CTA, FAQ, etc.)
│   └── ui/                       # Base reusable components (Button, Card, Modal, etc.)
├── lib/
│   ├── data/                     # Static data (FAQs, testimonials, service categories)
│   ├── middleware/                # Auth + cache middleware for API routes
│   ├── services/                 # Business logic services (one per entity)
│   ├── utils/                    # File parser, cache manager
│   ├── validations/              # Zod schemas per entity
│   ├── redis.ts                  # Redis client singleton
│   ├── supabase.ts               # Supabase client + server client
│   ├── providers.tsx             # Supabase React provider
│   └── mantine-provider.tsx      # Mantine theme provider
├── types/
│   ├── database.ts               # Full Supabase DB type definitions
│   └── auth.ts                   # Auth types, roles, permissions, Zod schemas
├── utils/
│   ├── cn.ts                     # classNames utility (clsx + tailwind-merge)
│   └── image.ts                  # Image URL validation
└── styles/                       # Global CSS
```

### 3.2 Data Model (20 tables)

The database is substantial with these core entities:

| Entity | Purpose |
|---|---|
| **profiles** | User accounts with membership tiers (basic/premium/VIP/black), admin flags, MFA settings |
| **destinations** | Travel destinations with country, region, climate, highlights, image galleries |
| **experiences** | Bookable activities with pricing, capacity, duration, categories |
| **packages** | Curated bundles tied to destinations with itinerary, inclusions/exclusions, pricing |
| **package_items** | Reusable service components (accommodation, transport, security, dining, etc.) |
| **package_item_options** | Configurable options for each service item with individual pricing |
| **package_experiences** | Many-to-many linking packages to experiences |
| **package_option_mappings** | Many-to-many linking packages to item options |
| **package_partner_services** | Partner service assignments within packages (with pricing, commission) |
| **partners** | Service provider companies (hotels, transport, guides, etc.) |
| **bookings** | Customer bookings with traveler count, pricing breakdown, payment status, QR codes |
| **booking_options** | Selected options for each booking |
| **booking_service_assignments** | Partner assignments for fulfilling booked services |
| **reviews** | Customer reviews per booking/package |
| **plan_requests** | Lead capture - customers requesting custom trip plans |
| **app_roles** | Role assignments per user |
| **role_permissions** | Granular permission definitions per role |
| **admin_sessions** | Server-managed admin sessions with tokens |
| **otp_codes** | One-time password codes for admin login |
| **admin_settings** | Key-value application settings |
| **audit_logs** | Action tracking for admin operations |
| **faqs** | FAQ content management |

### 3.3 Authentication & Authorization

The project implements a **custom OTP-based authentication** system for admin users (not using Supabase Auth's built-in features):

- **Admin Login Flow**: Email → OTP sent via SMTP → OTP verified → Server-managed session created → Session token stored in localStorage
- **Session Management**: Custom `admin_sessions` table with expiry (8-hour timeout), last-accessed tracking
- **Role Hierarchy**: `super_admin (3) > admin (2) > staff (1) > partner (0) = guest (0)`
- **Permission System**: Resource-action pairs (e.g., `destinations:create`, `bookings:read`) mapped to roles
- **Frontend Guards**: `AuthGuard` component wrapping admin pages, `useAuth`, `usePermission`, `useRoleLevel` hooks
- **API Middleware**: `checkAdminAuth()` validates Bearer tokens on admin API routes

User-facing auth (login/register pages) exists but appears to use standard Supabase Auth.

### 3.4 Caching Layer

Redis-based caching with:
- Tag-based invalidation (e.g., invalidate all `destinations` cache on CRUD)
- TTL-based expiry (30 min for public data, 5 min for admin data)
- Cache statistics tracking (hits/misses/sets/deletes)
- `getOrSet` pattern for transparent caching
- Cache warmup capability
- Health check and stats API endpoints
- Graceful degradation when Redis is unavailable

### 3.5 Email Service

Nodemailer-based with:
- SMTP configuration (defaulting to Gmail)
- Branded HTML email templates (Expajo-styled OTP emails)
- Development fallback (console logging when SMTP not configured)
- Test email capabilities

### 3.6 Data Import/Export

The admin panel supports bulk data operations:
- JSON and CSV import for destinations, experiences, and package items
- Export to JSON format
- File parsing utilities (both client and server-side)
- Sample data files provided in `/public/samples/`

---

## 4. Strengths

1. **Well-Typed Codebase**: Full TypeScript with strict mode, comprehensive database type definitions, Zod validation schemas for all entities.

2. **Comprehensive RBAC**: Thoughtful role-permission system with hierarchy, granular permissions, and both frontend and backend enforcement.

3. **Service Layer Pattern**: Clean separation between API routes and business logic through service classes (`DestinationService`, `AuthService`, `CacheService`, etc.).

4. **Caching Architecture**: Redis caching with tag-based invalidation is a mature pattern that will scale well.

5. **Admin Tooling**: The admin panel has real CRUD functionality with import/export, bulk operations, filtering, and relationship management — not just a skeleton.

6. **Design System**: Defined color palette, typography, spacing system, and custom component variants.

7. **Audit Logging**: Built-in audit log table for tracking admin actions.

---

## 5. Architectural Concerns & Issues

### 5.1 Security Issues

- **Session Token Generation** (`src/lib/services/auth.ts:546-552`): Uses `Math.random()` for session tokens. This is **cryptographically insecure**. Should use `crypto.randomBytes()` or `crypto.randomUUID()`.

- **OTP Generation** (`src/lib/services/auth.ts:41`): Uses `Math.random()` for OTP codes. Should use `crypto.randomInt()` for cryptographic randomness.

- **Session Tokens in localStorage**: Storing session tokens in `localStorage` is vulnerable to XSS attacks. HTTP-only cookies would be more secure.

- **Service Role Key Usage**: The server client bypasses RLS entirely via the service role key. While this is a common Supabase pattern, every admin API route depends on the custom auth middleware correctly guarding access — a single missed `checkAdminAuth()` call would expose data.

- **Permission Check via Client-Side API Call**: The `usePermission` hook sends `userId` in the POST body — an attacker could substitute any userId. Permission checks should derive the user from the session token server-side.

### 5.2 Architecture Issues

- **Dual Component Library**: Using both HeroUI and Mantine creates bundle size bloat, potential style conflicts, and developer confusion about which to use for any given component. Pick one.

- **Duplicate Type/Enum Definitions**: `ServiceType` and `ItemType` are defined identically in both `src/types/database.ts` and `src/lib/supabase.ts`. This will lead to drift.

- **No Next.js Middleware**: Auth protection relies solely on component-level `AuthGuard` and per-route API checks. A proper `middleware.ts` could provide route-level protection.

- **Admin Layout is `'use client'`**: The entire admin section is client-rendered. Server components could improve initial load performance and reduce JavaScript bundle size.

- **Dashboard Stats Fetching**: The admin dashboard fetches counts by requesting `?limit=1000` and counting array length. This won't scale — use database `count()` queries.

- **Missing Error Boundaries**: No error boundary components for graceful failure handling in the UI.

- **No Pagination on Public Pages**: Destination and experience listing pages don't implement pagination — they'll break with large datasets.

### 5.3 Code Quality Issues

- **Heavy Use of `as any` Casts**: Many Supabase client calls use `(serverClient as any)` or `(supabase as any)`, defeating TypeScript's type safety. This typically indicates the `Database` type definition is out of sync with actual usage.

- **Mixed Data Fetching Patterns**: Some pages use direct Supabase client calls, others use service classes, others use API route calls. Inconsistent data access patterns.

- **Commented-Out Code**: Several files contain commented-out logic (e.g., localStorage token storage in `AuthGuard.tsx:83-84`, `AdminLoginPage`) suggesting incomplete implementations.

- **No Environment Variable Validation**: The app uses `process.env.NEXT_PUBLIC_SUPABASE_URL!` with non-null assertions instead of validating at startup.

### 5.4 Testing

- Minimal testing — only one test file found (`Button.test.tsx`). No API route tests, no service layer tests, no integration tests.

### 5.5 Missing Infrastructure

- **No database migrations**: No Supabase migration files checked into the repo. Schema is managed outside version control.
- **No CI/CD pipeline**: No GitHub Actions, no automated testing/linting in CI.
- **No Dockerfile** (the commit message says "add docker file" but no Dockerfile exists).
- **No rate limiting** on API endpoints (especially the OTP endpoint).
- **No request validation middleware** — each route handler manually validates.

---

## 6. Feature Completeness Assessment

| Feature | Status |
|---|---|
| Landing page with sections | Implemented |
| Destination browsing (public) | Implemented |
| Experience browsing (public) | Implemented |
| Package browsing (public) | Implemented |
| Plan request form (lead capture) | Implemented |
| Admin login (OTP) | Implemented |
| Admin dashboard | Implemented (partially — stats are incomplete) |
| Admin destination CRUD | Implemented (with import/export) |
| Admin experience CRUD | Implemented (with import/export) |
| Admin package CRUD | Implemented (with relationships) |
| Admin package items CRUD | Implemented |
| Admin package item options | Implemented |
| User registration/login | Pages exist, appears incomplete |
| Booking flow | Schema exists, service layer exists, **no frontend** |
| Payment processing | Schema fields exist, **no payment gateway integration** |
| User booking history | Page exists, likely non-functional without booking flow |
| Review system | Schema exists, **no frontend** |
| Partner management | Schema/service exists, **no admin UI** |
| User management (admin) | API route exists, **minimal UI** |
| Search with filters | Page exists, functionality appears basic |
| Notifications | No implementation |
| Multi-language support | Schema field exists (`preferred_language`), not implemented |
| Membership tiers | Schema fields exist, not implemented |

---

## 7. Suggested Features & Requirements

### 7.1 Critical (Must-Have for Launch)

1. **Payment Integration**: Integrate a payment gateway (Stripe, Paystack for Nigeria, or Flutterwave). The booking schema already has `payment_status` and `payment_reference` fields ready.

2. **Complete Booking Flow**: Build the end-to-end booking UI — package selection, date picking, traveler count, option selection, price calculation, checkout, and confirmation with QR code.

3. **Security Hardening**:
   - Replace `Math.random()` with cryptographic random for OTP and session tokens
   - Move session tokens to HTTP-only cookies
   - Add rate limiting on auth endpoints (OTP request, login)
   - Add CSRF protection
   - Validate environment variables at startup

4. **User Authentication Completion**: Finish the user-facing auth flow (registration, email verification, password reset, profile management).

5. **Database Migrations**: Set up Supabase migrations and check them into version control so schema changes are reproducible and reviewable.

6. **CI/CD Pipeline**: GitHub Actions for linting, type-checking, and testing on PRs.

### 7.2 High Priority (Should-Have)

7. **Partner Portal**: Partners (hotels, transport providers, guides) should have their own login and dashboard to manage their services, view assignments, update availability, and track commissions.

8. **Booking Management (Admin)**: Admin UI to view, manage, and fulfill bookings — assign partners, update status, handle cancellations/refunds.

9. **Review & Rating System (Frontend)**: Allow users to leave reviews after completed trips. Display ratings on packages and experiences.

10. **Search & Filtering Improvements**: Full-text search, price range filters, date availability filters, category filters, sort options, pagination.

11. **Notification System**: Email notifications for booking confirmations, status changes, partner assignments, and plan request responses. Consider push notifications.

12. **Admin Activity Feed**: Surface audit logs in the admin dashboard as a recent activity stream.

13. **Image Management**: Integrate with Supabase Storage or a CDN (Cloudinary, Uploadcare) for proper image uploads instead of relying on external URLs (Unsplash placeholders).

### 7.3 Medium Priority (Nice-to-Have)

14. **Itinerary Builder**: Visual itinerary builder for packages — day-by-day activity planning with drag-and-drop.

15. **Dynamic Pricing**: Price rules based on season, group size, lead time, demand. The schema has `discount_percent` and `availability` JSON fields ready.

16. **Multi-Currency Support**: The schema has a `currency` field (currently hardcoded to USD). Support NGN, EUR, GBP with exchange rate conversion.

17. **Wishlist / Favorites**: Let users save destinations and packages they're interested in.

18. **Referral / Affiliate Program**: Track referrals, provide affiliate links, commission tracking.

19. **Blog / Content Marketing**: Travel guides, destination spotlights, experience stories — SEO-driving content.

20. **Analytics Dashboard (Admin)**: Revenue tracking, booking trends, popular destinations, conversion funnels, partner performance metrics.

21. **Membership Tier Features**: Implement the existing membership tier schema (basic/premium/VIP/black) with tier-specific pricing, early access, and exclusive packages.

22. **Mobile App / PWA**: The responsive web design is a good start, but a PWA with offline support for trip details would improve the traveler experience.

### 7.4 Technical Improvements

23. **Consolidate UI Libraries**: Choose either HeroUI or Mantine. Eliminating one will reduce bundle size and simplify development.

24. **Server Components**: Convert appropriate pages and layouts from client to server components for better performance.

25. **API Route Middleware**: Create a reusable middleware chain for API routes (auth check → permission check → rate limit → validation → handler).

26. **Proper Pagination**: Implement cursor-based or offset pagination across all list endpoints and pages.

27. **Error Handling**: Add React error boundaries, global API error handler, and user-friendly error pages (404, 500).

28. **Monitoring & Logging**: Integrate structured logging (Pino) and error tracking (Sentry).

29. **Testing**: Unit tests for services, integration tests for API routes, E2E tests for critical flows (booking, admin CRUD) using Playwright or Cypress.

30. **OpenAPI Documentation**: Auto-generate API docs from route handlers for partner/developer consumption.

---

## 8. Summary

Expajo is a **moderately mature** travel platform with a solid foundation in its data model, admin tooling, and caching infrastructure. The backend architecture (Supabase + Redis + service layer pattern) is appropriate for the domain. The admin panel is notably well-developed for CRUD operations with import/export capabilities.

The main gaps are on the **customer-facing side**: the booking flow, payment processing, user authentication, and review system are incomplete. The security model needs hardening before production use, particularly around token generation and session management. The codebase would also benefit from consolidating its UI framework choice, adding tests, and setting up proper CI/CD.

The business domain (curated travel packages for Nigerian destinations with partner service composition) is clearly defined and well-modeled in the database schema. With the booking flow and payment integration completed, the platform would be functional for early users.
